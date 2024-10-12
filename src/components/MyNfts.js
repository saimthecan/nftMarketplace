// File: /src/components/MyNfts.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Badge,
  Button,
  Input,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import noImage from "../assests/noImage.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import useAlchemy from "../Hooks/useAlchemy";
import useWeb3Provider from "../Hooks/useWeb3Provider";
import useApproveNFT from "../Hooks/useApproveNFT";
import useCheckApproval from "../Hooks/useCheckApproval";
import useNFTActions from "../Hooks/MyNfts/useNFTActions";
import useAuctionActions from "../Hooks/MyNfts/useAuctionActions";
import useUnlistedNftsData from "../Hooks/MyNfts/useUnlistedNftsData";
import { formatEther } from "ethers/utils";
import useCancelNFTSale from "../Hooks/NftSale/useCancelNFTSale";
import useOnAuctionData from "../Hooks/MyNfts/useOnAuctionData";
import useCancelNFTAuction from "../Hooks/NftAuction/useCancelNFTAuction";
import useWalletConnection from "../Hooks/useWalletConnection";
import Pagination from "./Pagination";
import noNftWallet from "../assests/noNftWallet.png";
import noNftSale from "../assests/noNftSale.png";
import noNftAuction from "../assests/noNftAuction.png";
import LoadingSpinner from './LoadingSpinner'; 

const MyNfts = () => {
  const [enteredPrices, setEnteredPrices] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [auctionStartTime, setAuctionStartTime] = useState(new Date());
  const [auctionEndTime, setAuctionEndTime] = useState(new Date());
  const [displayedList, setDisplayedList] = useState("unlisted");
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isAuctionModalOpen, setAuctionModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [unlistedNfts, setUnlistedNfts] = useState([]);
  const [isLoadingUnlistedNfts, setIsLoadingUnlistedNfts] = useState(false);

  const [currentPageUnlisted, setCurrentPageUnlisted] = useState(1);
  const [totalPagesUnlisted, setTotalPagesUnlisted] = useState(0);

  const [currentPageForSale, setCurrentPageForSale] = useState(1);
  const [totalPagesForSale, setTotalPagesForSale] = useState(0);

  const [currentPageOnAuction, setCurrentPageOnAuction] = useState(1);
  const [totalPagesOnAuction, setTotalPagesOnAuction] = useState(0);

  const itemsPerPage = 5;

  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);

  const { nftData, loadingListedSale, errorListedSale } = useUnlistedNftsData();
  const { nftDataAuction } = useOnAuctionData();
  const { latestBids } = useSelector((state) => state.nftAuction);
  const { switchToSepoliaNetwork } = useWalletConnection();

  useEffect(() => {
    setTotalPagesUnlisted(Math.ceil(unlistedNfts.length / itemsPerPage));
  }, [unlistedNfts]);

  useEffect(() => {
    setTotalPagesForSale(Math.ceil(nftData.length / itemsPerPage));
  }, [nftData]);

  useEffect(() => {
    setTotalPagesOnAuction(Math.ceil(nftDataAuction.length / itemsPerPage));
  }, [nftDataAuction]);

  const getCurrentPageUnlistedNfts = () => {
    const indexOfLastItem = currentPageUnlisted * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return unlistedNfts.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getCurrentPageForSaleNfts = () => {
    const indexOfLastItem = currentPageForSale * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return nftData.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getCurrentPageOnAuctionNfts = () => {
    const indexOfLastItem = currentPageOnAuction * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return nftDataAuction.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChangeOnAuction = (pageNumber) => {
    setCurrentPageOnAuction(pageNumber);
  };

  const handlePageChangeUnlisted = (pageNumber) => {
    setCurrentPageUnlisted(pageNumber);
  };

  const handlePageChangeForSale = (pageNumber) => {
    setCurrentPageForSale(pageNumber);
  };

  const onSellModalOpen = (nft) => {
    setSelectedNft(nft);
    setSellModalOpen(true);
  };
  const onSellModalClose = () => setSellModalOpen(false);

  const onAuctionModalOpen = (nft) => {
    setSelectedNft(nft);
    setAuctionModalOpen(true);
  };
  const onAuctionModalClose = () => setAuctionModalOpen(false);

  const wallet = useSelector((state) => state.wallet.account);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  const alchemy = useAlchemy();

  const { provider, signer } = useWeb3Provider();

  const checkApproval = useCheckApproval(provider, CONTRACT_ADDRESS);

  const { approveNFT } = useApproveNFT(signer, CONTRACT_ADDRESS);

  const cancelAuction = useCancelNFTAuction(signer, CONTRACT_ADDRESS);

  const cancelNFTSale = useCancelNFTSale(signer, provider, CONTRACT_ADDRESS);

  const { startNFTSale } = useNFTActions(signer, provider, CONTRACT_ADDRESS);

  const sellNFT = async (nft) => {
    if (!nft.contract || !nft.contract.address) {
      toast.error("Contract details are missing. Please check your NFT object.");
      return;
    }

    const contractAddress = nft.contract.address;
    const tokenId = nft.tokenId;
    const nftType = nft.tokenType === "ERC721" ? 0 : 1;
    const owner = await signer.getAddress();

    try {
      const isApproved = await checkApproval(nftType, contractAddress, tokenId, CONTRACT_ADDRESS, owner);

      if (!isApproved) {
        try {
          await approveNFT(contractAddress, tokenId, nftType);
        } catch (error) {
          if (error.message.includes("user rejected transaction")) {
            toast.error("You have rejected the approval process.");
            return;
          } else {
            throw error;
          }
        }
      }

      const price = enteredPrices[tokenId];
      if (!price || isNaN(parseFloat(price))) {
        toast.error("Please enter a valid ETH value");
        return;
      }

      const quantity = enteredQuantities[tokenId] || 1;

      await startNFTSale(nft, price, quantity);
      onSellModalClose();
      setUnlistedNfts(unlistedNfts.filter((n) => n.tokenId !== nft.tokenId));
      toast.success("NFT is listed for sale successfully.");
    } catch (error) {
      toast.error("Error during the process");
    }
  };

  const { startNFTAuction } = useAuctionActions(signer, provider, CONTRACT_ADDRESS);

  const startAuction = async (nft) => {
    const contractAddress = nft.contract.address;
    const tokenId = nft.tokenId;
    const nftType = nft.tokenType === "ERC721" ? 0 : 1;
    const owner = await signer.getAddress();

    const price = enteredPrices[tokenId];
    if (!price || isNaN(parseFloat(price))) {
      toast.error("Please enter a valid ETH value");
      return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const unixTimestampStart = Math.floor(auctionStartTime.getTime() / 1000);
    const unixTimestampEnd = Math.floor(auctionEndTime.getTime() / 1000);

    if (unixTimestampStart <= currentTimestamp) {
      toast.error("Auction start time must be in the future.");
      return;
    }
    if (unixTimestampEnd <= unixTimestampStart) {
      toast.error("Auction end time must be after the start time.");
      return;
    }

    try {
      const isApproved = await checkApproval(nftType, contractAddress, tokenId, CONTRACT_ADDRESS, owner);

      if (!isApproved) {
        try {
          await approveNFT(contractAddress, tokenId, nftType);
        } catch (error) {
          if (error.message.includes("user rejected transaction")) {
            toast.error("You have rejected the approval process.");
            return;
          } else {
            throw error;
          }
        }
      }

      const quantity = enteredQuantities[tokenId] || 1;

      await startNFTAuction(nft, price, unixTimestampStart, unixTimestampEnd, quantity);
      onAuctionModalClose();
      setUnlistedNfts(unlistedNfts.filter((n) => n.tokenId !== nft.tokenId));
      toast.success("NFT is listed for auction successfully.");
    } catch (error) {
      toast.error("Error during the process");
    }
  };

  const loadUnlistedNfts = useCallback(async () => {
    if (wallet) {
      setIsLoadingUnlistedNfts(true);
      const nftsForOwner = await alchemy.nft.getNftsForOwner(wallet);
      setUnlistedNfts(
        nftsForOwner.ownedNfts.filter((nft) => nft.tokenType === "ERC721")
      );
      setIsLoadingUnlistedNfts(false);
    }
  }, [alchemy.nft, wallet]);

  const toggleList = (list) => {
    setDisplayedList(list);
    if (list === "unlisted") {
      loadUnlistedNfts();
    }
  };

  useEffect(() => {
    if (displayedList === "unlisted") {
      loadUnlistedNfts();
    }
  }, [displayedList, loadUnlistedNfts]);

  if (!wallet) {
    return (
      <Box w="100%" p={5} textAlign="center">
        <Text fontSize="xl" color="red.500">
          You need to connect your wallet to access this page.
        </Text>
      </Box>
    );
  }

  if (loadingListedSale) return <LoadingSpinner />;
  if (errorListedSale)
    return <Text>Error loading NFTs: {errorListedSale.message}</Text>;

  return (
    <Box
      w="100%"
      minH="100vh"
      p={5}
      bg="linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/bg.jpg')"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
      bgColor="gray.100"
    >
      <Flex justifyContent="flex-end" mb="4">
        <Tooltip placement="top">
          <Button
            width="110px"
            fontSize="14px"
            onClick={() => toggleList("unlisted")}
            bgColor={displayedList === "unlisted" ? "green" : "gray.300"}
            _hover={displayedList === "unlisted" ? "green" : "gray.300"}
            color={displayedList === "unlisted" ? "white" : "black"}
          >
            Unlisted
          </Button>
        </Tooltip>
        <Tooltip placement="top">
          <Button
            width="110px"
            fontSize="14px"
            bgColor={displayedList === "nftsforsale" ? "green" : "gray.300"}
            _hover={displayedList === "nftsforsale" ? "green" : "gray.300"}
            color={displayedList === "nftsforsale" ? "white" : "black"}
            onClick={() => setDisplayedList("nftsforsale")}
            ml="2"
          >
            For Sale
          </Button>
        </Tooltip>
        <Tooltip placement="top">
          <Button
            width="110px"
            fontSize="14px"
            ml="2"
            bgColor={displayedList === "onAuction" ? "green" : "gray.300"}
            _hover={displayedList === "onAuction" ? "green" : "gray.300"}
            onClick={() => toggleList("onAuction")}
            color={displayedList === "onAuction" ? "white" : "black"}
          >
            In Auction
          </Button>
        </Tooltip>
      </Flex>

      {displayedList === "onAuction" && (
        <>
          <Flex wrap="wrap">
            {nftDataAuction.length === 0 ? (
              <Box
              display="flex"
              alignItems="center"
             
              minHeight="100vh" // Tüm ekranı kaplayacak şekilde minHeight ayarlandı
              flexDirection="column"
              textAlign="center"
             w="100vw"
            >
              <Box
                bg="white"
                borderRadius="md"
                p={3}
                mt={4}
                width="fit-content"
                mx="auto"
                boxShadow="lg"
                position="relative"
                _after={{
                  content: '""',
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  marginLeft: "-10px",
                  borderWidth: "10px",
                  borderStyle: "solid",
                  borderColor: "white transparent transparent transparent",
                }}
              >
                <Text fontSize="lg">
                "The auction has started, but there’s no NFT! <br /> I'm just swinging the gavel for nothing here. Come on, list an NFT and let the fun begin! 😂🔨"
                </Text>
              </Box>
              <Image
                src={noNftAuction}
                alt="NFT Character"
                boxSize="250px"
                mx="auto"
              />
            </Box>
            ) : (
              <Flex wrap="wrap">
                {getCurrentPageOnAuctionNfts().map((nft, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="md"
                    m={2}
                    overflow="auto"
                    width="350px"
                  >
                    <Image
                      src={nft.metadata?.image || noImage}
                      alt={`NFT ${nft.tokenId}`}
                      boxSize="300px"
                      mt={4}
                    />
                    <Flex flexDirection="column" gap={2} mt={2}>
                      <Text>
                        <strong>Name:</strong> {nft.metadata?.name}
                      </Text>
                      <Text>
                        <strong>Description:</strong>{" "}
                        {nft.metadata?.description}
                      </Text>
                      <Text>
                        <strong>Created By:</strong> {nft.metadata?.created_by}
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
                      {isWrongNetwork ? (
                        <Button
                          mt={4}
                          colorScheme="red"
                          onClick={switchToSepoliaNetwork}
                        >
                          Wrong Network - Switch to Sepolia
                        </Button>
                      ) : (
                        <Button
                          w="150px"
                          mt={4}
                          colorScheme="red"
                          onClick={() => cancelAuction(nft, index)}
                        >
                          Cancel NFT Sale
                        </Button>
                      )}
                    </Flex>
                  </Box>
                ))}
              </Flex>
            )}
          </Flex>
          {nftDataAuction.length > 0 && (
            <Box display="flex" justifyContent="center" p={4}>
              <Pagination
                currentPage={currentPageOnAuction}
                totalPages={totalPagesOnAuction}
                onPageChange={handlePageChangeOnAuction}
              />
            </Box>
          )}
        </>
      )}

      {displayedList === "nftsforsale" && (
        <>
          <Flex wrap="wrap">
            {nftData.length === 0 ? (
             <Box
             display="flex"
             alignItems="center"
            
             minHeight="100vh" // Tüm ekranı kaplayacak şekilde minHeight ayarlandı
             flexDirection="column"
             textAlign="center"
            w="100vw"
           >
             <Box
               bg="white"
               borderRadius="md"
               p={3}
               mt={4}
               width="fit-content"
               mx="auto"
               boxShadow="lg"
               position="relative"
               _after={{
                 content: '""',
                 position: "absolute",
                 top: "100%",
                 left: "50%",
                 marginLeft: "-10px",
                 borderWidth: "10px",
                 borderStyle: "solid",
                 borderColor: "white transparent transparent transparent",
               }}
             >
               <Text fontSize="lg">
               "The stall is empty, but the wallet could be full! <br /> List your NFTs, maybe riches are just around the corner! 😊💸"
               </Text>
             </Box>
             <Image
               src={noNftSale}
               alt="NFT Character"
               boxSize="250px"
               mx="auto"
             />
           </Box>
            ) : (
              getCurrentPageForSaleNfts().map((nft, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  boxShadow="md"
                  m={2}
                  overflow="auto"
                  width="350px"
                >
                  <Image
                    src={nft.metadata?.image || noImage}
                    alt={`NFT ${nft.tokenId}`}
                    boxSize="300px"
                    mt={4}
                  />
                  <Flex flexDirection="column" gap={2} mt={2}>
                    <Text>
                      <strong>Name:</strong> {nft.metadata?.name}
                    </Text>
                    <Text>
                      <strong>Description:</strong> {nft.metadata?.description}
                    </Text>
                    <Text>
                      <strong>Created By:</strong> {nft.metadata?.created_by}
                    </Text>
                    <Text>
                      <strong>Price:</strong> {formatEther(nft.price)} ETH
                    </Text>
                    {isWrongNetwork ? (
                      <Button
                        mt={4}
                        colorScheme="red"
                        onClick={switchToSepoliaNetwork}
                      >
                        Wrong Network - Switch to Sepolia
                      </Button>
                    ) : (
                      <Button
                        mt={4}
                        colorScheme="red"
                        onClick={() => cancelNFTSale(nft.NFTMarketplace_id)}
                        w="150px"
                      >
                        Cancel NFT Sale
                      </Button>
                    )}
                  </Flex>
                </Box>
              ))
            )}
          </Flex>
          {nftData.length > 0 && (
            <Box display="flex" justifyContent="center" p={4}>
              <Pagination
                currentPage={currentPageForSale}
                totalPages={totalPagesForSale}
                onPageChange={handlePageChangeForSale}
              />
            </Box>
          )}
        </>
      )}

      {displayedList === "unlisted" && (
        <>
          <Flex wrap="wrap">
            {isLoadingUnlistedNfts ? (
              <LoadingSpinner />
            ) : unlistedNfts.length === 0 ? (
              <Box
  display="flex"
  alignItems="center"
 
  minHeight="100vh" // Tüm ekranı kaplayacak şekilde minHeight ayarlandı
  flexDirection="column"
  textAlign="center"
 w="100vw"
>
  <Box
    bg="white"
    borderRadius="md"
    p={3}
    mt={4}
    width="fit-content"
    mx="auto"
    boxShadow="lg"
    position="relative"
    _after={{
      content: '""',
      position: "absolute",
      top: "100%",
      left: "50%",
      marginLeft: "-10px",
      borderWidth: "10px",
      borderStyle: "solid",
      borderColor: "white transparent transparent transparent",
    }}
  >
    <Text fontSize="lg">
    "Wallet’s empty, but the market’s full! <br /> Maybe buying an NFT will cheer me up. 😅"
    </Text>
  </Box>
  <Image
    src={noNftWallet}
    alt="NFT Character"
    boxSize="250px"
    mx="auto"
  />
</Box>
            ) : (
              getCurrentPageUnlistedNfts().map((nft, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  boxShadow="md"
                  m={2}
                >
                  <Badge
                    colorScheme="green"
                    ml="1"
                  >{`Balance: ${nft.balance}`}</Badge>
                  <Image
                    boxSize="300px"
                    src={nft.rawMetadata?.image || noImage}
                    alt="NFT Image"
                    mt={4}
                  />
                  <Flex flexDirection="column" gap={2} mt={2}>
                    <Text>
                      <strong>Name:</strong> {nft.contract.name}
                    </Text>
                    <Text>
                      <strong>Description:</strong>{" "}
                      {nft.rawMetadata?.description}
                    </Text>
                    <Text>
                      <strong>Created By:</strong> {nft.rawMetadata?.created_by}
                    </Text>
                  </Flex>
                  {isWrongNetwork ? (
                    <Button
                      mt={4}
                      colorScheme="red"
                      onClick={switchToSepoliaNetwork}
                    >
                      Wrong Network - Switch to Sepolia
                    </Button>
                  ) : (
                    <Flex mt={4}>
                      <Button
                        w="150px"
                        colorScheme="blue"
                        onClick={() => onSellModalOpen(nft)}
                      >
                        Sell
                      </Button>
                      <Button
                        w="150px"
                        colorScheme="green"
                        onClick={() => onAuctionModalOpen(nft)}
                      >
                        Auction
                      </Button>
                    </Flex>
                  )}
                </Box>
              ))
            )}
          </Flex>
          {unlistedNfts.length > 0 && !isLoadingUnlistedNfts && (
            <Box display="flex" justifyContent="center" p={4}>
              <Pagination
                currentPage={currentPageUnlisted}
                totalPages={totalPagesUnlisted}
                onPageChange={handlePageChangeUnlisted}
              />
            </Box>
          )}
        </>
      )}

      {selectedNft && (
        <Modal isOpen={isSellModalOpen} onClose={onSellModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Sell NFT</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md">
                <Badge colorScheme="green">{`Balance: ${selectedNft.balance}`}</Badge>
                <Image
                  boxSize="300px"
                  src={selectedNft.rawMetadata?.image || noImage}
                  alt="NFT Image"
                  mt={4}
                />
                <Flex flexDirection="column" gap={2} mt={2}>
                  <Text>{`Name: ${selectedNft.contract.name}`}</Text>
                  <Text>{`Description: ${selectedNft.rawMetadata?.description}`}</Text>
                  <Text>{`Token ID: ${selectedNft.tokenId}`}</Text>
                  <Input
                    type="number"
                    placeholder="Enter listing price in ETH"
                    value={enteredPrices[`${selectedNft.tokenId}`] || ""}
                    onChange={(e) =>
                      setEnteredPrices((prevPrices) => ({
                        ...prevPrices,
                        [`${selectedNft.tokenId}`]: e.target.value,
                      }))
                    }
                  />
                  {selectedNft.tokenType === "ERC1155" && (
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={enteredQuantities[`${selectedNft.tokenId}`] || ""}
                      onChange={(e) =>
                        setEnteredQuantities((prevQuantities) => ({
                          ...prevQuantities,
                          [`${selectedNft.tokenId}`]: e.target.value,
                        }))
                      }
                    />
                  )}
                </Flex>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={() => sellNFT(selectedNft)}>
                Sell NFT
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {selectedNft && (
        <Modal isOpen={isAuctionModalOpen} onClose={onAuctionModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Start Auction</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md">
                <Badge colorScheme="green">{`Balance: ${selectedNft.balance}`}</Badge>
                <Image
                  boxSize="350px"
                  src={selectedNft.rawMetadata?.image || noImage}
                  alt="NFT Image"
                  mt={4}
                  mx="auto"
                />
                <Flex flexDirection="column" gap={2} mt={2}>
                  <Text>{`Name: ${selectedNft.contract.name}`}</Text>
                  <Text>{`Description: ${selectedNft.rawMetadata?.description}`}</Text>
                  <Text>{`Token ID: ${selectedNft.tokenId}`}</Text>
                  <Input
                    type="number"
                    placeholder="Enter listing price in ETH"
                    value={enteredPrices[`${selectedNft.tokenId}`] || ""}
                    onChange={(e) =>
                      setEnteredPrices((prevPrices) => ({
                        ...prevPrices,
                        [`${selectedNft.tokenId}`]: e.target.value,
                      }))
                    }
                  />
                  {selectedNft.tokenType === "ERC1155" && (
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={enteredQuantities[`${selectedNft.tokenId}`] || ""}
                      onChange={(e) =>
                        setEnteredQuantities((prevQuantities) => ({
                          ...prevQuantities,
                          [`${selectedNft.tokenId}`]: e.target.value,
                        }))
                      }
                    />
                  )}
                  <Text>
                    <strong>AuctionStartTime</strong>
                  </Text>
                  <DatePicker
                    onChange={setAuctionStartTime}
                    selected={auctionStartTime}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={5}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                  />
                  <Text>
                    <strong>AuctionEndTime</strong>
                  </Text>
                  <DatePicker
                    onChange={setAuctionEndTime}
                    selected={auctionEndTime}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={5}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                  />
                </Flex>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="green"
                onClick={() => startAuction(selectedNft)}
              >
                Start Auction
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default MyNfts;
