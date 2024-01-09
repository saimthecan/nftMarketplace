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

const NFTAuction = () => {
  //states
  const { nftImages, nftDetails, unsoldNFTs } = useNFTAuctionData();
    const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);
  const [enteredPrices, setEnteredPrices] = useState({});

  const wallet = useSelector((state) => state.wallet.account);
  const { connectWallet, switchToGoerliNetwork } = useWalletConnection();

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
        templateColumns={{ base: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
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
              w="350px"
            >
              {nftImages[nft.tokenId] && (
                <Image
                  src={nftImages[nft.tokenId]}
                  alt={`NFT ${nft.tokenId}`}
                />
              )}
              <Text  mt={3}>
                <strong>Name:</strong> {nftDetails[nft.tokenId]?.name}
              </Text>
              <Text>
                <strong>Description:</strong>{" "}
                {nftDetails[nft.tokenId]?.description}
              </Text>
              <Text>
                <strong>Created By:</strong>{" "}
                {nftDetails[nft.tokenId]?.createdBy}
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
                  // If the current user is the seller
                  <Button
                    colorScheme="red"
                    onClick={() => cancelAuction(nft, index)}
                    mt={4}
                  >
                    Cancel Auction
                  </Button>
                ) : !isAuctionStarted(nft) ? (
                  // If the auction has not started
                  <Text mt={4}>Açık artırma başlamadı</Text>
                ) : isAuctionEnded(nft) ? (
                  // If the auction has ended
                  <Text mt={4}>Açık artırmanın süresi doldu</Text>
                ) : isUserHighestBidder(nft) ? (
                  // If the current user is the highest bidder
                  <Text mt={4}>
                    <strong>You have the highest bid</strong>
                  </Text>
                ) : (
                  // Allow the user to place a bid
                  <Box mt={2}>
                    <Input
                      type="number"
                      placeholder="Enter bid price in ETH"
                      value={enteredPrices[`${index}-${nft.tokenId}`] || ""}
                      onChange={(e) =>
                        setEnteredPrices((prevPrices) => ({
                          ...prevPrices,
                          [`${index}-${nft.tokenId}`]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      mt={4}
                      colorScheme="blue"
                      onClick={() => {
                        const price = enteredPrices[`${index}-${nft.tokenId}`];
                        if (!price || isNaN(parseFloat(price))) {
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
                    onClick={switchToGoerliNetwork}
                  >
                    Wrong Network - Switch to Goerli
                  </Button>
                )
              ) : (
                // If the user's wallet is not connected
                <Button mt={4} colorScheme="teal" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              )}

              {isAuctionEndedAndUserIsHighestBidder(nft) && (
                // If the auction has ended and the current user is the highest bidder
                <Button colorScheme="blue" onClick={() => claimNFT(nft)}>
                  Claim NFT
                </Button>
              )}
            </Box>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default NFTAuction;
