import React, { useEffect, useState, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { GET_LISTED_NFTS, GET_SOLD_NFTS } from "../queries/nftQueries";
import client from "../config/apolloClient";
import { Box, Text, Image, Grid, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { marketplace } from "./marketplace";
import { Web3Provider } from "@ethersproject/providers";

const NFTList = () => {
  const {
    loading: loadingListed,
    error: errorListed,
    data: dataListed,
  } = useQuery(GET_LISTED_NFTS, { client, pollInterval: 5000 });
  const {
    loading: loadingSold,
    error: errorSold,
    data: dataSold,
  } = useQuery(GET_SOLD_NFTS, { client, pollInterval: 5000 });
  const [nftImages, setNftImages] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [userAddress, setUserAddress] = useState(null);
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);

  const alchemyApiKey = "4fzUXD3ZGkDM_iosciExOfbF_4V0blFV";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const alchemyProvider = new JsonRpcProvider(
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`
  );
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const CONTRACT_ADDRESS = "0x548d43c9a6f0d13a22b3196a727b36982602ca22";

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

  const buyNFT = async (id, price) => {
    console.log(id);
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );
    console.log(id, price);
    try {
      await marketplaceContract.buyNFT(id, { value: price });
      console.log("NFT bought successfully!");
    } catch (error) {
      console.error("An error occurred while buying the NFT:", error);
    }
  };

  const cancelNFTSale = async (id) => {
    // Assuming you have a function in your smart contract to cancel the sale
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );
    try {
      await marketplaceContract.cancelNFTSale(id);
      console.log("NFT sale cancelled successfully!");
    } catch (error) {
      console.error("An error occurred while cancelling the NFT sale:", error);
    }
  };

  useEffect(() => {
    if (dataListed && dataListed.nftlistedForSales) {
      dataListed.nftlistedForSales.forEach(async (nft) => {
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

  // Fetch the user's address
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const address = await signer.getAddress();
        setUserAddress(address);
      } catch (error) {
        console.error("Error fetching user address:", error);
      }
    };

    fetchUserAddress();
  }, [signer]);

  useEffect(() => {
    if (
      dataListed &&
      dataListed.nftlistedForSales &&
      dataSold &&
      dataSold.nftsolds
    ) {
      const soldIds = dataSold.nftsolds.map((nft) => nft.Contract_id);
      const unsold = dataListed.nftlistedForSales.filter(
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
        templateColumns={{ base: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }} // 3 sütunlu bir grid düzeni tanımla
        gap={4} // grid öğeleri arasında boşluk bırak
      >
        {!unsoldNFTs.length ? (
          <Text>No data available</Text>
        ) : (
          unsoldNFTs.map((nft) => (
            <Box
              key={nft.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              boxShadow="md"
              overflow="auto"
            >
              {nftImages[nft.tokenId] && (
                <Image
                  src={nftImages[nft.tokenId]}
                  alt={`NFT ${nft.tokenId}`}
                />
              )}
              <Text>
                <strong>Contract Address:</strong> {nft.contractAddress}
              </Text>
              <Text>
                <strong>ID:</strong> {nft.tokenId}
              </Text>
              <Text>
                <strong>Seller:</strong> {nft.seller}
              </Text>
              <Text>
                <strong>Price:</strong> {nft.price}
              </Text>
              {nft.seller.toLowerCase() === userAddress?.toLowerCase() ? (
                <Button
                  mt={4}
                  colorScheme="red"
                  onClick={() => cancelNFTSale(nft.Contract_id)}
                >
                  Cancel NFT Sale
                </Button>
              ) : (
                <Button
                  mt={4}
                  colorScheme="blue"
                  onClick={() => buyNFT(nft.Contract_id, nft.price)}
                >
                  Buy NFT
                </Button>
              )}
            </Box>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default NFTList;
