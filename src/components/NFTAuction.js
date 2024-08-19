import React, { useEffect, useState } from "react";
import { Box, Text, Image, Grid, Button, Input } from "@chakra-ui/react";
import { formatEther } from "ethers/utils";
import { toast } from "react-toastify";
import useQueries from "../Hooks/useQueries";
import useWeb3Provider from "../Hooks/useWeb3Provider";
import { useSelector, useDispatch } from "react-redux";
import useNFTAuctionData from "../Hooks/NftAuction/useNFTAuctionData";
import useCancelNFTAuction from "../Hooks/NftAuction/useCancelNFTAuction";
import useClaimNFTAuction from "../Hooks/NftAuction/useClaimNFTAuction";
import usePlaceBid from "../Hooks/NftAuction/usePlaceBid";
import useAuctionOutcome from "../Hooks/NftAuction/useAuctionOutcome";
import { fetchLatestBids } from "../ReduxToolkit/nftAuctionSlice";
import useWalletConnection from "../Hooks/useWalletConnection";
import noImage from "../assests/noImage.png";
import Pagination from "./Pagination";

const NFTAuction = () => {
  //states
  const { nftImages, nftDetails, unsoldNFTs } = useNFTAuctionData();
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);
  const [enteredPrices, setEnteredPrices] = useState({});

  const wallet = useSelector((state) => state.wallet.account);
  const { connectWallet, switchToSepoliaNetwork } = useWalletConnection();

  const { latestBids, loading, error } = useSelector(
    (state) => state.nftAuction
  );
  const balance = useSelector((state) => state.wallet.balance);
  const account = useSelector((state) => state.wallet.account);

  const dispatch = useDispatch();

  //queries
  const {
    loadingListedAuction,
    errorListedAuction,
    loadingSoldAuction,
    errorSoldAuction,
    loadingCancelledAuction,
    errorCancelledAuction,
  } = useQueries();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = unsoldNFTs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(unsoldNFTs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  //Web3 Provider
  const { signer } = useWeb3Provider();

  //Contract Address
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  //FUNCTIONS
  // useCancelAuction hook'unu kullan
  const cancelAuction = useCancelNFTAuction(signer, CONTRACT_ADDRESS);

  // usePlaceBid hook'unu kullan
  const placeBid = usePlaceBid(
    signer,
    CONTRACT_ADDRESS,
    enteredPrices,
    balance,
    latestBids
  );

  // useClaimNFT hook'unu kullan
  const claimNFT = useClaimNFTAuction(signer, CONTRACT_ADDRESS);

  const {
    isAuctionEnded,
    isAuctionStarted,
    isAuctionEndedAndUserIsHighestBidder,
    isUserHighestBidder,
  } = useAuctionOutcome();

  //USE EFFECTS

  useEffect(() => {
    dispatch(fetchLatestBids());
  }, [dispatch]);

  if (loading) return "Loading...";
  if (error) return `Error: ${error}`;

  if (loadingListedAuction || loadingSoldAuction || loadingCancelledAuction)
    return "Loading...";
  if (errorListedAuction || errorSoldAuction || errorCancelledAuction)
    return `Error! ${
      errorListedAuction?.message ||
      errorSoldAuction?.message ||
      errorCancelledAuction?.message
    }`;

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
          <Text>No Nft In Auction Yet</Text>
        ) : (
          currentItems.map((nft, index) => {
            const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
            console.log(`Key: ${uniqueKey}, Image: ${nftImages[uniqueKey]}`);
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
                <Image
                  src={nftImages[uniqueKey] || noImage}
                  alt={`NFT ${nft.tokenId}`}
                  boxSize="250px" // Sabit bir genişlik ve yükseklik belirleyin
                  objectFit="cover" // Görselin boyutlandırılmasını ayarlayın
                  borderRadius="md" // Görselin köşelerini yuvarlatın
                />

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
                  <strong>Auction Start Time:</strong>{" "}
                  {new Date(nft.auctionStartTime * 1000).toLocaleString()}
                </Text>
                <Text>
                  <strong>Auction End Time:</strong>{" "}
                  {new Date(nft.auctionEndTime * 1000).toLocaleString()}
                </Text>
                <Text>
                  <strong>Starting Price:</strong>{" "}
                  {formatEther(nft.startingPrice)} ETH
                </Text>
                <Text>
                  <strong>Last Bid: </strong>{" "}
                  {latestBids[nft.Contract_id]
                    ? `${formatEther(latestBids[nft.Contract_id].amount)} ETH`
                    : "No bids yet"}
                </Text>

                {wallet ? (
                  !isWrongNetwork ? (
                    nft.seller.toLowerCase() === account?.toLowerCase() ? (
                      <Button
                        mt={4}
                        colorScheme="red"
                        onClick={() => cancelAuction(nft, index)}
                      >
                        Cancel Auction
                      </Button>
                    ) : !isAuctionStarted(nft) ? (
                      <Text mt={4}>The auction has not started yet.</Text>
                    ) : isAuctionEnded(nft) ? (
                      <Text mt={4}>The auction has expired.</Text>
                    ) : isUserHighestBidder(nft) ? (
                      <Text mt={4}>
                        <strong>You have the highest bid</strong>
                      </Text>
                    ) : (
                      <Box mt={2}>
                        <Input
                          type="number"
                          placeholder="Enter bid price in ETH"
                          value={enteredPrices[uniqueKey] || ""}
                          onChange={(e) =>
                            setEnteredPrices((prevPrices) => ({
                              ...prevPrices,
                              [uniqueKey]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          mt={4}
                          colorScheme="blue"
                          onClick={() => {
                            const price = enteredPrices[uniqueKey];
                            if (!price || isNaN(Number(price))) {
                              toast.error("Please enter a valid ETH value");
                            } else {
                              placeBid(nft, index);
                            }
                          }}
                        >
                          Bid on NFT
                        </Button>
                      </Box>
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

                {isAuctionEndedAndUserIsHighestBidder(nft) && (
                  <Button colorScheme="blue" onClick={() => claimNFT(nft)}>
                    Claim NFT
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

export default NFTAuction;
