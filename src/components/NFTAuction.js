import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_LISTED_NFTS_FOR_AUCTION,
  GET_FINISHED_NFT_AUCTIONS,
  GET_CANCELLED_NFT_AUCTIONS,
  GET_NFT_BIDS,
} from "../queries/nftQueries";
import client from "../config/apolloClient";
import { Box, Text, Image, Grid, Button, Input } from "@chakra-ui/react";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { marketplace } from "./marketplace";
import { Web3Provider } from "@ethersproject/providers";
import { parseEther, formatEther } from "ethers/utils";
import { toast } from "react-toastify";

const NFTAuction = () => {
  //states
  const [nftImages, setNftImages] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);
  const [enteredPrices, setEnteredPrices] = useState({});
  const [userAddress, setUserAddress] = useState(null);
  const [latestBids, setLatestBids] = useState({});

  //queries
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
  const {
    loading: loadingCancelled,
    error: errorCancelled,
    data: dataCancelled,
  } = useQuery(GET_CANCELLED_NFT_AUCTIONS, { client, pollInterval: 5000 });

  //Alchemy
  const alchemyApiKey = "4fzUXD3ZGkDM_iosciExOfbF_4V0blFV";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const alchemyProvider = new JsonRpcProvider(
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`
  );
  const provider = useMemo(() => new Web3Provider(window.ethereum), []);
  const signer = provider.getSigner();

  //contractAddress
  const CONTRACT_ADDRESS = "0x548d43c9a6f0d13a22b3196a727b36982602ca22";

  //FUNCTIONS

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
  const getNFTMetadata = useCallback(
    async (contractAddress, tokenId) => {
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
    },
    [alchemyProvider]
  );

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

    const currentBalance = await getWalletBalance();
    if (
      !currentBalance ||
      parseFloat(currentBalance) <= parseFloat(priceInWei)
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

  //USE EFFECTS

  //enables the getwalletbalance function to work
  useEffect(() => {
    getWalletBalance();
  }, [getWalletBalance, userAddress]);

  //receive the latest NFT offers
  useEffect(() => {
    fetchLatestBids();
  }, []);

  //Allows images of NFTs to appear
  useEffect(() => {
    const fetchNFTMetadata = async () => {
      if (dataListed && dataListed.nftlistedForAuctions) {
        const metadataPromises = dataListed.nftlistedForAuctions.map((nft) =>
          getNFTMetadata(nft.contractAddress, nft.tokenId)
        );

        try {
          const metadataList = await Promise.all(metadataPromises);
          const newNftImages = metadataList.reduce((acc, metadata, index) => {
            const tokenId = dataListed.nftlistedForAuctions[index].tokenId;
            return metadata.image ? { ...acc, [tokenId]: metadata.image } : acc;
          }, {});

          setNftImages(newNftImages);
        } catch (error) {
          console.error("Error fetching NFT metadata:", error);
        }
      }
    };

    fetchNFTMetadata();
  }, [dataListed, getNFTMetadata]);

  //Filters unsold and uncanceled NFTs and creates the current list.
  useEffect(() => {
    if (
      dataListed &&
      dataListed.nftlistedForAuctions &&
      dataSold &&
      dataSold.nftauctionFinisheds &&
      dataCancelled &&
      dataCancelled.nftauctionCancelleds
    ) {
      const soldIds = dataSold.nftauctionFinisheds.map(
        (nft) => nft.Contract_id
      );
      const cancelledIds = dataCancelled.nftauctionCancelleds.map(
        (nft) => nft.Contract_id
      );
      const unsold = dataListed.nftlistedForAuctions.filter(
        (nft) =>
          !soldIds.includes(nft.Contract_id) &&
          !cancelledIds.includes(nft.Contract_id)
      );
      setUnsoldNFTs(unsold);
    }
  }, [dataListed, dataSold, dataCancelled]);

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

  if (loadingListed || loadingSold || loadingCancelled) return "Loading...";
  if (errorListed || errorSold || errorCancelled)
    return `Error! ${
      errorListed?.message || errorSold?.message || errorCancelled?.message
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
              ) : isUserHighestBidder(nft) ? (
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
