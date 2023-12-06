import React, { useEffect, useState } from "react";
import {GET_NFT_BIDS} from "../queries/nftQueries";
import client from "../config/apolloClient";
import { Box, Text, Image, Grid, Button, Input } from "@chakra-ui/react";
import { ethers } from "ethers";
import { marketplace } from "./marketplace";
import { parseEther, formatEther } from "ethers/utils";
import { toast } from "react-toastify";
import useQueries from "../Hooks/useQueries"
import useAlchemyProvider from "../Hooks/useAlchemyProvider";
import useWeb3Provider from "../Hooks/useWeb3Provider";
import useNFTMetadata from '../Hooks/useNFTMetadata';
import { useSelector } from 'react-redux';


const NFTAuction = () => {
  //states
  const [nftImages, setNftImages] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);
  const [enteredPrices, setEnteredPrices] = useState({});
  const [userAddress, setUserAddress] = useState(null);
  const [latestBids, setLatestBids] = useState({});

  const balance = useSelector((state) => state.wallet.balance);


  //queries
  const { 
    loadingListedAuction, errorListedAuction, dataListedAuction,
    loadingSoldAuction, errorSoldAuction,dataSoldAuction,
    loadingCancelledAuction, errorCancelledAuction, dataCancelledAuction,
  } = useQueries();

  //Alchemy Provider
  const alchemyProvider = useAlchemyProvider();

  //Web3 Provider
   const { provider, signer } = useWeb3Provider();

  //Contract Address
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
 

  //FUNCTIONS

  //function to control the highest bid
  const isUserHighestBidder = (nft) => {
    return (
      latestBids[nft.Contract_id] &&
      userAddress &&
      latestBids[nft.Contract_id].bidder.toLowerCase() ===
        userAddress.toLowerCase()
    );
  };

  //Helper function to view images of NFTs in auction
  const getNFTMetadata = useNFTMetadata(alchemyProvider);

  //Function that allows the user to bid on an NFT
  const placeBid = async (nft, index) => {
    const uniqueKey = `${index}-${nft.tokenId}`;
    const priceInEth = enteredPrices[uniqueKey];

    // Check if the price is not a number or empty
    if (!priceInEth || isNaN(parseFloat(priceInEth))) {
      toast.error("Please enter a valid number");
      return;
    }

    const priceInWei = parseEther(priceInEth.toString());
    const startingPriceInWei = nft.startingPrice;

     // Check if the entered bid is lower than the starting price
     if (priceInWei <= startingPriceInWei) {
      toast.error("Your bid cannot be lower than the starting price.");
      return;
    }

    const Contract_id = nft.Contract_id;
    const currentHighestBid = latestBids[nft.Contract_id]
      ? latestBids[nft.Contract_id].amount
      : 0;

    if (
      !balance ||
      parseFloat(balance) <= parseFloat(priceInWei)
    ) {
      toast.error("Insufficient Balance");
      return;
    }

    if (priceInWei <= currentHighestBid) {
      toast.error("Your bid must be higher than the current highest bid.");
      return;
    }

    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );
    try {
      const tx = await marketplaceContract.bid(Contract_id, { value: priceInWei });
      await provider.waitForTransaction(tx.hash, 1); // İşlemin tamamlanmasını bekleyin
      console.log("Bid placed successfully!");
      toast.success("Bid placed successfully!")
    } catch (error) {
      if (error.message.includes("user rejected transaction")) {
        toast.error("Transaction rejected.");
      }
    }
    
  };

  //function that allows the user who owns the nfty in the auction to cancel the auction
  const cancelAuction = async (nft, index) => {
    const Contract_id = nft.Contract_id;
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer 
    );

    try {
      const tx = await marketplaceContract.cancelNFTAuction(Contract_id);
      await provider.waitForTransaction(tx.hash, 1); // İşlemin tamamlanmasını bekleyin
      toast.success("Auction cancelled successfully!")
      console.log("Auction cancelled successfully!");
    } catch (error) {
      console.error("An error occurred while cancelling the auction:", error);
    }
    
  };

  //function that allows to see the last offer
  const fetchLatestBids = async () => {
    try {
      const { data } = await client.query({
        query: GET_NFT_BIDS,
      });
  
      // Her Contract_id için en son teklifi bul
      const latestBids = data.nftbids.reduce((acc, bid) => {
        const existingBid = acc[bid.Contract_id];
        if (!existingBid || bid.blockTimestamp > existingBid.blockTimestamp) {
          acc[bid.Contract_id] = {
            amount: bid.amount,
            bidder: bid.bidder,
            blockTimestamp: bid.blockTimestamp
          };
        }
        return acc;
      }, {});
  
      setLatestBids(latestBids);
    } catch (error) {
      console.error("Error fetching latest bids:", error);
    }
  };
  

  // En yüksek teklifi kontrol etme ve açık artırma süresinin bitip bitmediğini kontrol etme
const isAuctionEndedAndUserIsHighestBidder = (nft) => {
  const currentHighestBid = latestBids[nft.Contract_id]
    ? latestBids[nft.Contract_id].amount
    : 0;
  const isUserHighestBidder =
    userAddress &&
    latestBids[nft.Contract_id]?.bidder.toLowerCase() ===
      userAddress.toLowerCase();
  const isAuctionEnded = new Date().getTime() >= nft.auctionEndTime * 1000;

  return isAuctionEnded && isUserHighestBidder;
};

// finishNFTAuction fonksiyonunu çağırma
const claimNFT = async (nft) => {
  const marketplaceContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    marketplace,
    signer
  );

  try {
    const tx = await marketplaceContract.finishNFTAuction(nft.Contract_id);
    await provider.waitForTransaction(tx.hash, 1); // İşlemin tamamlanmasını bekleyin
    console.log("Auction finished successfully!");
    toast.success("Successfully claimed")
  } catch (error) {
    console.error("An error occurred while finishing the auction:", error);
  }
  
};

 // Açık artırma süresinin bitip bitmediğini kontrol eden fonksiyon
 const isAuctionEnded = (nft) => {
  return new Date().getTime() >= nft.auctionEndTime * 1000;
};

const isAuctionStarted = (nft) => {
  return new Date().getTime() >= nft.auctionStartTime * 1000;
};


  //USE EFFECTS

  //enables the getwalletbalance function to work


  //receive the latest NFT offers
  useEffect(() => {
    fetchLatestBids();
  }, [ ]);

 //Allows images of NFTs to appear
 useEffect(() => {
  const fetchNFTMetadata = async () => {
    if (dataListedAuction && dataListedAuction.nftlistedForAuctions) {
      const metadataPromises = dataListedAuction.nftlistedForAuctions.map((nft) =>
        getNFTMetadata(nft.contractAddress, nft.tokenId)
      );

      try {
        const metadataList = await Promise.all(metadataPromises);
        const newNftImages = metadataList.reduce((acc, metadata, index) => {
          const tokenId = dataListedAuction.nftlistedForAuctions[index].tokenId;
          return metadata.image ? { ...acc, [tokenId]: metadata.image } : acc;
        }, {});

        setNftImages(newNftImages);
      } catch (error) {
        console.error("Error fetching NFT metadata:", error);
      }
    }
  };

  fetchNFTMetadata();
}, [dataListedAuction, getNFTMetadata]);

  //Filters unsold and uncanceled NFTs and creates the current list.
  useEffect(() => {
    if (
      dataListedAuction &&
      dataListedAuction.nftlistedForAuctions &&
      dataSoldAuction &&
      dataSoldAuction.nftauctionFinisheds &&
      dataCancelledAuction &&
      dataCancelledAuction.nftauctionCancelleds
    ) {
      const soldIds = dataSoldAuction.nftauctionFinisheds.map(
        (nft) => nft.Contract_id
      );
      const cancelledIds = dataCancelledAuction.nftauctionCancelleds.map(
        (nft) => nft.Contract_id
      );
      const unsold = dataListedAuction.nftlistedForAuctions.filter(
        (nft) =>
          !soldIds.includes(nft.Contract_id) &&
          !cancelledIds.includes(nft.Contract_id)
      );
      setUnsoldNFTs(unsold);
    }
  }, [dataListedAuction, dataSoldAuction, dataCancelledAuction]);
  //function to get the user's Ethereum address
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




  if (loadingListedAuction || loadingSoldAuction || loadingCancelledAuction) return "Loading...";
  if (errorListedAuction || errorSoldAuction || errorCancelledAuction)
    return `Error! ${
      errorListedAuction?.message || errorSoldAuction?.message || errorCancelledAuction?.message
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
                <strong>Starting Price:</strong> {formatEther(nft.startingPrice)} ETH
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

              {nft.seller.toLowerCase() === userAddress?.toLowerCase() ? (
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
                <Text><strong>You have the highest bid</strong></Text>
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
