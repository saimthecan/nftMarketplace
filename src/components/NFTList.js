import React from "react";
import { useSelector } from "react-redux";
import { Box, Text, Image, Grid, Button } from "@chakra-ui/react";
import { formatEther } from "ethers/utils";
import useQueries from "../Hooks/useQueries";
import useWeb3Provider from "../Hooks/useWeb3Provider";
import useBuyNFT from "../Hooks/NftSale/useBuyNFT";
import useCancelNFTSale from "../Hooks/NftSale/useCancelNFTSale";
import useNFTListData from "../Hooks/NftSale/useNFTListData";

const NFTList = () => {
  const { nftImages, unsoldNFTs } = useNFTListData();
  console.log("listed",unsoldNFTs);

  // Redux state'inden account bilgisini al
  const account = useSelector((state) => state.wallet.account);
  const balance = useSelector((state) => state.wallet.balance);

  //Web3 Provider
  const { provider, signer } = useWeb3Provider();

  //Contract Address
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  //queries
  const { loadingListedSale, errorListedSale, loadingSold, errorSold } =
    useQueries();

  //Helper function to buy Nft
  const buyNFT = useBuyNFT(signer, provider, CONTRACT_ADDRESS, balance);

  // useCancelNFTSale hook'unu kullan
  const cancelNFTSale = useCancelNFTSale(signer, provider, CONTRACT_ADDRESS);

  if (loadingListedSale || loadingSold) return "Loading...";
  if (errorListedSale || errorSold)
    return `Error! ${errorListedSale?.message || errorSold?.message}`;
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
                boxSize="300px"
                mt={4}
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
              {nft.seller.toLowerCase() === account?.toLowerCase() ? (
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
