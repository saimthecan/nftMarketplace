import React, { useEffect, useState, useCallback } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_LISTED_NFTS_FOR_AUCTION,
  GET_FINISHED_NFT_AUCTIONS,
} from "../queries/nftQueries";
import client from "../config/apolloClient";
import { Box, Text, Image, Grid, Button, Input } from "@chakra-ui/react";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { marketplace } from "./marketplace";
import { Web3Provider } from "@ethersproject/providers";
import { parseEther } from "ethers/utils";

const NFTMarketplace = () => {
  const {
    loading: loadingListed,
    error: errorListed,
    data: dataListed,
  } = useQuery(GET_LISTED_NFTS_FOR_AUCTION, { client, pollInterval: 5000 });
  const {
    loading: loadingSold,
    error: errorSold,
    data: dataSold,
  } = useQuery(GET_FINISHED_NFT_AUCTIONS, { client, pollInterval: 5000 });
  const [nftImages, setNftImages] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);
  const [enteredPrices, setEnteredPrices] = useState({});

  const alchemyApiKey = "4fzUXD3ZGkDM_iosciExOfbF_4V0blFV";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const alchemyProvider = new JsonRpcProvider(
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`
  );
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const CONTRACT_ADDRESS = "0xDaC2C5D1BD3265740Ed7bdFc5b8948Cc41aC4972";

  const getNFTMetadata = useCallback(async (contractAddress, tokenId) => {
    const contract = new ethers.Contract(
      contractAddress,
      [
        "function tokenURI(uint256 tokenId) external view returns (string memory)",
      ],
      alchemyProvider
    );
    const tokenUri = await contract.tokenURI(tokenId);
    const response = await fetch(tokenUri);
    const metadata = await response.json();
    return metadata;
  }, []);

  const NFTType = {
    ERC721: 0,
    ERC1155: 1,
  };


  const placeBid = async (nft,index) => {
    const uniqueKey = `${index}-${nft.tokenId}`;
    const priceInEth = enteredPrices[uniqueKey];
    const priceInWei = parseEther(priceInEth.toString());
    const Contract_id = nft.Contract_id;

    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );
    try {
      await marketplaceContract.bid(Contract_id, { value: priceInWei });
      console.log("Bid placed successfully!");
    } catch (error) {
      console.error("An error occurred while placing the bid:", error);
    }
  };

  useEffect(() => {
    if (dataListed && dataListed.nftlistedForAuctions) {
      dataListed.nftlistedForAuctions.forEach(async (nft) => {
        const metadata = await getNFTMetadata(nft.contractAddress, nft.tokenId);
        if (metadata.image) {
          setNftImages((prevState) => ({
            ...prevState,
            [nft.tokenId]: metadata.image,
          }));
        }
      });
    }
  }, [dataListed, getNFTMetadata]);

  useEffect(() => {
    if (
      dataListed &&
      dataListed.nftlistedForAuctions &&
      dataSold &&
      dataSold.nftauctionFinisheds
    ) {
      const soldIds = dataSold.nftauctionFinisheds.map(
        (nft) => nft.Contract_id
      );
      const unsold = dataListed.nftlistedForAuctions.filter(
        (nft) => !soldIds.includes(nft.Contract_id)
      );
      setUnsoldNFTs(unsold);
    }
  }, [dataListed, dataSold]);

  if (loadingListed || loadingSold) return "Loading...";
  if (errorListed || errorSold)
    return `Error! ${errorListed?.message || errorSold?.message}`;
  if (!unsoldNFTs.length) return "No data available";

  return (
    <Box
      w="100%"
      minH="100vh"
      p={5}
      bg={`linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/bg.jpg')`}
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
      bgColor="gray.100"
    >
      <Grid
        templateColumns={{ base: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
        gap={4}
      >
        {unsoldNFTs.length === 0 ? (
          <Text>No NFTs available for auction</Text>
        ) : (
          unsoldNFTs.map((nft, index) => (
            <Box
              key={index}
              p={4}
              borderWidth={1}
              borderRadius="md"
              boxShadow="md"
              overflow="hidden"
            >
              {nftImages[nft.tokenId] && (
                <Image src={nftImages[nft.tokenId]} alt={`NFT ${nft.tokenId}`} />
              )}
              <Text mt={2}><strong>Token ID:</strong> {nft.tokenId}</Text>
              <Text><strong>Seller:</strong> {nft.seller}</Text>
              <Box mt={2}>
              <Input
                type="number"
                placeholder="Enter listing price in ETH"
                value={enteredPrices[`${index}-${nft.tokenId}`] || ""} // Benzersiz anahtar ile fiyatı al
                onChange={(e) =>
                  setEnteredPrices((prevPrices) => ({
                    ...prevPrices,
                    [`${index}-${nft.tokenId}`]: e.target.value, // Benzersiz anahtar ile fiyatı güncelle
                  }))
                }
              />
                <Button 
                  mt={2}
                  colorScheme="blue"
                  onClick={() => placeBid(nft, index)}
                >
                  Bid on NFT
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Grid>
    </Box>
  );
  
};

export default NFTMarketplace;
