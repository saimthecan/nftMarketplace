import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Text, Image, Grid, Button } from "@chakra-ui/react";
import { formatEther } from "ethers/utils";
import useQueries from "../Hooks/useQueries";
import useWeb3Provider from "../Hooks/useWeb3Provider";
import useBuyNFT from "../Hooks/NftSale/useBuyNFT";
import useCancelNFTSale from "../Hooks/NftSale/useCancelNFTSale";
import useNFTListData from "../Hooks/NftSale/useNFTListData";
import useWalletConnection from "../Hooks/useWalletConnection";
import noImage from "../assests/noImage.png";
import Pagination from "./Pagination";

const NFTList = () => {
  const wallet = useSelector((state) => state.wallet.account);

  const { connectWallet, switchToSepoliaNetwork } = useWalletConnection();
  const { nftImages, nftDetails, unsoldNFTs } = useNFTListData();
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = unsoldNFTs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(unsoldNFTs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
        templateColumns="repeat(auto-fit, minmax(300px, 0.2fr))"
        gap={0}
        mb={10}
      >
        {currentItems.length === 0 ? (
          <Text>No Nft On Sale Yet</Text>
        ) : (
          currentItems.map((nft) => {
            const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
            return (
              <Box
                key={uniqueKey}
                p={4}
                borderWidth={1}
                borderRadius="md"
                boxShadow="md"
                overflow="auto"
                w="300px"
              >
                {nftImages[uniqueKey] && (
                  <Image
                    src={nftImages[uniqueKey] || noImage}
                    alt={`NFT ${nft.tokenId}`}
                  />
                )}
                <Text mt={3}>
                  <strong>Name:</strong> {nftDetails[uniqueKey]?.name}
                </Text>
                <Text>
                  <strong>Description:</strong>{" "}
                  {nftDetails[uniqueKey]?.description}
                </Text>
                <Text>
                  <strong>Created By:</strong>{" "}
                  {nftDetails[uniqueKey]?.createdBy}
                </Text>
                <Text>
                  <strong>Price:</strong> {formatEther(nft.price)} ETH
                </Text>

                {wallet ? (
                  !isWrongNetwork ? (
                    nft.seller.toLowerCase() === account?.toLowerCase() ? (
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
                    )
                  ) : (
                    <Button
                      mt={4}
                      colorScheme="red"
                      onClick={switchToSepoliaNetwork}
                    >
                      Wrong Network - Switch to Sepolia
                    </Button>
                  )
                ) : (
                  <Button mt={4} colorScheme="teal" onClick={connectWallet}>
                    Connect Wallet
                  </Button>
                )}
              </Box>
            );
          })
        )}
      </Grid>
      {currentItems.length > 0 && (
        <Box display="flex" justifyContent="center" p={4}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default NFTList;
