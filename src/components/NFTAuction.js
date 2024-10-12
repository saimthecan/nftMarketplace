import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Select,
  Text,
  Image,
  Grid,
  Button,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react";
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
import noAuction from "../assests/noauction.png";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";
import NftEmpty from "./NftEmpty";

const NFTAuction = () => {
  //states
  const { nftImages, nftDetails, unsoldNFTs } = useNFTAuctionData();
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);
  const wallet = useSelector((state) => state.wallet.account);

  const [sortCriteria, setSortCriteria] = useState("lastBid");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [enteredPrices, setEnteredPrices] = useState({});

  const { connectWallet, switchToSepoliaNetwork } = useWalletConnection();

  const { latestBids, loading, error } = useSelector(
    (state) => state.nftAuction
  );
  const [loadingImages, setLoadingImages] = useState({});
  const balance = useSelector((state) => state.wallet.balance);
  const account = useSelector((state) => state.wallet.account);

  const dispatch = useDispatch();

  const gridTemplateColumns = useBreakpointValue({
    base: "1fr", // Mobilde tek sütun
    md: "repeat(auto-fit, minmax(300px, 0.2fr))", // Masaüstünde grid düzeni
  });
  const boxWidth = useBreakpointValue({ base: "100%", md: "300px" });
  const imageBoxSize = useBreakpointValue({ base: "300px", md: "250px" });

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

  // Kategori bazlı filtreleme
  const filteredItems = unsoldNFTs.filter((nft) => {
    const categoryName =
      nftDetails[`${nft.contractAddress}_${nft.tokenId}`]?.name || "Unknown";
    return selectedCategory === "" || categoryName === selectedCategory;
  });

  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(unsoldNFTs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Kategorileri belirlemek için benzersiz isimler
  const categories = Array.from(
    new Set(
      unsoldNFTs.map(
        (nft) =>
          nftDetails[`${nft.contractAddress}_${nft.tokenId}`]?.name || "Unknown"
      )
    )
  );

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const sortedItems = [...currentItems].sort((a, b) => {
    let valueA, valueB;
    switch (sortCriteria) {
      case "startingPrice":
        valueA = parseFloat(formatEther(a.startingPrice));
        valueB = parseFloat(formatEther(b.startingPrice));
        break;
      case "lastBid":
        valueA = latestBids[a.NFTMarketplace_id]
          ? parseFloat(formatEther(latestBids[a.NFTMarketplace_id].amount))
          : 0;
        valueB = latestBids[b.NFTMarketplace_id]
          ? parseFloat(formatEther(latestBids[b.NFTMarketplace_id].amount))
          : 0;
        break;
      case "auctionStartTime":
        valueA = a.auctionStartTime;
        valueB = b.auctionStartTime;
        break;
      case "auctionEndTime":
        valueA = a.auctionEndTime;
        valueB = b.auctionEndTime;
        break;
      default:
        return 0;
    }
    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
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

  const handleImageLoad = (uniqueKey) => {
    setLoadingImages((prevLoading) => ({
      ...prevLoading,
      [uniqueKey]: false, // Resim yüklendiğinde 'false' yapıyoruz
    }));
  };

  //USE EFFECTS

  useEffect(() => {
    dispatch(fetchLatestBids());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return `Error: ${error}`;

  if (loadingListedAuction || loadingSoldAuction || loadingCancelledAuction)
    return <LoadingSpinner />;
  if (errorListedAuction || errorSoldAuction || errorCancelledAuction)
    return `Error! ${
      errorListedAuction?.message ||
      errorSoldAuction?.message ||
      errorCancelledAuction?.message
    }`;

  const text =
    "Left all alone on this big stage... <br /> Waiting for bids, but they never came. 😢";
  const imageSrc = noAuction; // Farklı bir resim

  // Eğer listede satılmamış NFT yoksa yeni bileşeni gösteriyoruz.
  if (currentItems.length === 0) {
    return <NftEmpty text={text} imageSrc={imageSrc} />;
  }

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
      {/* Sort and Filter Controls */}
      <Flex
        width={{ base: "100%", md: "40%" }}
        justify="flex-start"
        align="center"
        mb={6}
        gap={6}
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="md"
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="bold">
            Sort:
          </Text>
          <Select value={sortCriteria} onChange={handleSortChange} maxW="200px">
            <option value="lastBid">Last Bid</option>
            <option value="startingPrice">Starting Price</option>
            <option value="auctionStartTime">Auction Start Time</option>
            <option value="auctionEndTime">Auction End Time</option>
          </Select>
          <Button onClick={toggleSortOrder}>
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </Flex>

        <Flex align="center" gap={2} mt={{ base: 4, md: 0 }}>
          <Text fontSize="lg" fontWeight="bold">
            Category:
          </Text>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            maxW="200px"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>

      <Grid templateColumns={gridTemplateColumns} gap={0} mb={10}>
        {sortedItems.map((nft, index) => {
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
              w={boxWidth}
              mb="2rem"
            >
              <Image
                src={nftImages[uniqueKey] || noImage}
                alt={`NFT ${nft.tokenId}`}
                boxSize={imageBoxSize} // Sabit bir genişlik ve yükseklik belirleyin
                objectFit="cover" // Görselin boyutlandırılmasını ayarlayın
                borderRadius="md" // Görselin köşelerini yuvarlatın
                mx="auto"
                onLoad={() => handleImageLoad(uniqueKey)} // Resim yüklendiğinde state'i günceller
                display={loadingImages[uniqueKey] === false ? "block" : "none"} // Yükleme bitince göster
              />

              <Text mt={3}>
                <strong>Name:</strong> {nftDetails[uniqueKey]?.name}
              </Text>
              <Text>
                <strong>Description:</strong>{" "}
                {nftDetails[uniqueKey]?.description}
              </Text>
              <Text>
                <strong>Created By:</strong> {nftDetails[uniqueKey]?.createdBy}
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
                {latestBids[nft.NFTMarketplace_id]
                  ? `${formatEther(
                      latestBids[nft.NFTMarketplace_id].amount
                    )} ETH`
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
        })}
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
