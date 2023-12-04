import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_LISTED_NFTS, GET_SOLD_NFTS, GET_CANCELLED_NFT_SALES } from "../queries/nftQueries";
import client from "../config/apolloClient";
import { Box, Text, Image, Grid, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { marketplace } from "./marketplace";
import { Web3Provider } from "@ethersproject/providers";
import { toast } from "react-toastify";
import {  formatEther } from "ethers/utils";

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
  const {
    data: dataCancelledSales,
    loading: loadingCancelledSales,
    error: errorCancelledSales
  } = useQuery(GET_CANCELLED_NFT_SALES, { client, pollInterval: 5000 });

  const [nftImages, setNftImages] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [userAddress, setUserAddress] = useState(null);
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);

  const alchemyApiKey = "4fzUXD3ZGkDM_iosciExOfbF_4V0blFV";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const alchemyProvider = new JsonRpcProvider(
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`
  );
  const provider = useMemo(() => new Web3Provider(window.ethereum), []);
  const signer = provider.getSigner();

  const CONTRACT_ADDRESS = "0x548d43c9a6f0d13a22b3196a727b36982602ca22";

   //function to get the user's wallet balance as wei
   const getWalletBalance = useCallback(async () => {
    try {
      const userAddress = await signer.getAddress();
      const balanceInWei = await provider.getBalance(userAddress);

      // eslint-disable-next-line no-undef
      const bigNumberValue = BigInt(balanceInWei._hex);

      const decimalValue = bigNumberValue.toString();
      return decimalValue;
    } catch (error) {
      console.error("Bakiye alınırken bir hata oluştu:", error);
    }
  }, [provider, signer]);

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
  }, [alchemyProvider]);

  const buyNFT = async (id, price) => {
    const currentBalance = await getWalletBalance();
  

    if (
      !currentBalance ||
      parseFloat(currentBalance) <= parseFloat(price)
    ) {
      toast.error("Insufficient Balance");
      return;
    }
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );
    try {
      const tx = await marketplaceContract.buyNFT(id, { value: price });
      await provider.waitForTransaction(tx.hash, 1); // İşlemin tamamlanmasını bekleyin
      toast.success("NFT bought successfully!")
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
      const tx = await marketplaceContract.cancelNFTSale(id);
      await provider.waitForTransaction(tx.hash, 1); // İşlemin tamamlanmasını bekleyin
      toast.success("NFT sale cancelled successfully!")
      console.log("NFT sale cancelled successfully!");
    } catch (error) {
      console.error("An error occurred while cancelling the NFT sale:", error);
    }
  };

  //enables the getwalletbalance function to work
  useEffect(() => {
    getWalletBalance();
  }, [getWalletBalance, userAddress]);

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
    dataSold.nftsolds &&
    dataCancelledSales &&
    dataCancelledSales.nftsaleCancelleds
  ) {
    const soldIds = dataSold.nftsolds.map(nft => nft.Contract_id);
    const cancelledSaleIds = dataCancelledSales.nftsaleCancelleds.map(nft => nft.Contract_id);
    const unsold = dataListed.nftlistedForSales.filter(
      nft => !soldIds.includes(nft.Contract_id) && !cancelledSaleIds.includes(nft.Contract_id)
    );
    setUnsoldNFTs(unsold);
  }
}, [dataListed, dataSold, dataCancelledSales]);





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
                <strong>Price:</strong> {formatEther(nft.price)} ETH
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
