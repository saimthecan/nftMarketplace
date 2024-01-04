import React, { useEffect, useState } from "react";
import { Box, Text, Image, Grid, Button, Input } from "@chakra-ui/react";
import {  formatEther } from "ethers/utils";
import { toast } from "react-toastify";
import useQueries from "../Hooks/useQueries";
import useWeb3Provider from "../Hooks/useWeb3Provider";
import { useSelector, useDispatch } from "react-redux";
import useNFTAuctionData from "../Hooks/NftAuction/useNFTAuctionData";
import useCancelNFTAuction from "../Hooks/NftAuction/useCancelNFTAuction";
import useClaimNFTAuction from "../Hooks/NftAuction/useClaimNFTAuction";
import usePlaceBid from '../Hooks/NftAuction/usePlaceBid';
import useAuctionOutcome from '../Hooks/NftAuction/useAuctionOutcome';
import { fetchLatestBids } from '../ReduxToolkit/nftAuctionSlice';


const NFTAuction = () => {
  //states
  const { nftImages, unsoldNFTs } = useNFTAuctionData();
  const [enteredPrices, setEnteredPrices] = useState({});

  const { latestBids, loading, error } = useSelector((state) => state.nftAuction);
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
  const placeBid = usePlaceBid(signer, CONTRACT_ADDRESS, enteredPrices, balance, latestBids);

 // useClaimNFT hook'unu kullan
 const claimNFT = useClaimNFTAuction(signer, CONTRACT_ADDRESS);

 const { isAuctionEnded, isAuctionStarted , isAuctionEndedAndUserIsHighestBidder, isUserHighestBidder} = useAuctionOutcome();

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
            >
              {nftImages[nft.tokenId] && (
                <Image
                  src={nftImages[nft.tokenId]}
                  alt={`NFT ${nft.tokenId}`}
                />
              )}
              <Text mt={2}>
                <strong>Token ID:</strong> {nft.tokenId}
              </Text>
              <Text>
                <strong>Seller:</strong> {nft.seller}
              </Text>
              <Text>
                <strong>Contract ID:</strong> {nft.Contract_id}
              </Text>
              <Text>
                <strong>Starting Price:</strong>{" "}
                {formatEther(nft.startingPrice)} ETH
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
                <strong>Contract Address:</strong> {nft.contractAddress}
              </Text>
              <Text>
                <strong>Last Bid: </strong>{" "}
                {latestBids[nft.Contract_id]
                  ? `${formatEther(latestBids[nft.Contract_id].amount)} ETH`
                  : "No bids yet"}
              </Text>

              {nft.seller.toLowerCase() === account?.toLowerCase() ? (
                <Button
                  colorScheme="red"
                  onClick={() => cancelAuction(nft, index)}
                >
                  Cancel Auction
                </Button>
              ) : !isAuctionStarted(nft) ? (
                // Eğer açık artırma henüz başlamadıysa
                <Text>Açık artırma başlamadı</Text>
              ) : isAuctionEnded(nft) ? (
                // Eğer açık artırma süresi dolduysa
                <Text>Açık artırmanın süresi doldu</Text>
              ) : isUserHighestBidder(nft) ? (
                // Eğer kullanıcı en yüksek teklifi vermişse
                <Text>
                  <strong>You have the highest bid</strong>
                </Text>
              ) : (
                <Box mt={2}>
                  <Input
                    type="number"
                    placeholder="Enter listing price in ETH"
                    value={enteredPrices[`${index}-${nft.tokenId}`] || ""}
                    onChange={(e) =>
                      setEnteredPrices((prevPrices) => ({
                        ...prevPrices,
                        [`${index}-${nft.tokenId}`]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    mt={2}
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
              )}
              {isAuctionEndedAndUserIsHighestBidder(nft) && (
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
