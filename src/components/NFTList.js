import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_LISTED_NFTS } from "../queries/nftQueries";
import client from "../config/apolloClient";
import { Box, Text, Image, Grid, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { marketplace } from "./marketplace";  // İlgili import
import { Web3Provider } from "@ethersproject/providers";
import { parseUnits } from "@ethersproject/units";


// Note: Alchemy SDK is not necessary for this implementation, ethers.js is sufficient.

const NFTList = () => {
  const { loading, error, data } = useQuery(GET_LISTED_NFTS, { client });
  const [nftImages, setNftImages] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});

  const alchemyApiKey = "4fzUXD3ZGkDM_iosciExOfbF_4V0blFV";
  const alchemyProvider = new JsonRpcProvider(
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`
  );
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const CONTRACT_ADDRESS = "0x8A5759fE86420a33b23FD386b03829aBE938567a";

   // marketplaceContract nesnesini memoize et
   const marketplaceContract = useMemo(() => {
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );
  }, [signer]);

     const removeSoldNFT = useCallback((soldNFTId) => {
    // TODO: Apollo Client mutasyonu ile verileri güncelle
  }, []);

     // "NFTSold" olayını dinlemek için bir useEffect kullan
  useEffect(() => {
    const onNFTSold = (id, buyer, contractAddress, tokenId) => {
      console.log(`NFT Sold: ${id}`);
      removeSoldNFT(id);
    };

       // Olay dinleyicisini ekleyin
       const nftSoldListener = marketplaceContract.on("NFTSold", onNFTSold);

       // Olay dinleyicisini temizlemek için bir temizleme fonksiyonu döndürün
       return () => {
         marketplaceContract.off("NFTSold", nftSoldListener);
       };
     }, [marketplaceContract, removeSoldNFT]);

const NFTType = {
    ERC721: 0,
    ERC1155: 1,
};

  const getNFTMetadata = async (contractAddress, tokenId) => {
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
  };

  const gasPrice = parseUnits('30', 'gwei').toString();  // Gas price'ı 30 Gwei olarak belirtir ve string'e dönüştürür
  const gasLimit = parseUnits('300000', 'wei').toString();  // Gas limit'i 300,000 Wei olarak belirtir ve string'e dönüştürür


  const buyNFT = async (id , price) => {
  console.log(id)
    const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, marketplace, signer);
   console.log(id,price)
    try {
      await marketplaceContract.buyNFT(id, { value: price, gasPrice: gasPrice, gasLimit: gasLimit });
   
      console.log("NFT bought successfully!");
    } catch (error) {
      console.error("An error occurred while buying the NFT:", error);
    }
  };

  useEffect(() => {
    if (data && data.nftlistedForSales) {
      data.nftlistedForSales.forEach(async (nft) => {
        const metadata = await getNFTMetadata(nft.contractAddress, nft.tokenId);
        if (metadata.image) {
          setNftImages((prevState) => ({
            ...prevState,
            [nft.tokenId]: metadata.image,
          }));
        }
      });
    }
  }, [data]);

  

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  if (!data || !data.nftlistedForSales) return "No data available";

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
        templateColumns={{ base: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} // 3 sütunlu bir grid düzeni tanımla
        gap={4} // grid öğeleri arasında boşluk bırak
      >
        {(!data || !data.nftlistedForSales) ? (
          <Text>No data available</Text>
        ) : (
          data.nftlistedForSales.map(nft => (
            <Box
              key={nft.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              boxShadow="md"
              overflow="auto"
            >
              {nftImages[nft.tokenId] && <Image src={nftImages[nft.tokenId]} alt={`NFT ${nft.tokenId}`} />}
              <Text><strong>Contract Address:</strong> {nft.contractAddress}</Text>
              <Text><strong>ID:</strong> {nft.tokenId}</Text>
              <Text><strong>Seller:</strong> {nft.seller}</Text>
              <Text><strong>Price:</strong> {nft.price}</Text>
              <Button mt={4} colorScheme="blue" onClick={() => buyNFT(nft.Contract_id, nft.price)}>
    Buy NFT
</Button>



            </Box>
          ))
        )}
      </Grid>
    </Box>
  );
  
};

export default NFTList;