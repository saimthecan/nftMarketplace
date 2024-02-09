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
import NoNftWallet from "../assests/NoNftWallet.png";
import NoNftSale from "../assests/NoNftSale.png";
import NoNftAuction from "../assests/NoNftAuction.png";

const MyNfts = () => {
  const [enteredPrices, setEnteredPrices] = useState({});
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
    // Toplam sayfa sayısını hesaplayın ve güncelleyin
    setTotalPagesUnlisted(Math.ceil(unlistedNfts.length / itemsPerPage));
    // Diğer display'ler için benzer hesaplamalar yapılacak
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
console.log(unlistedNfts);
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

  // Redux state'inden account bilgisini al
  const wallet = useSelector((state) => state.wallet.account);

  //Contract Address
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  //useAlchemy
  const alchemy = useAlchemy();

  //Web3 Provider
  const { provider, signer } = useWeb3Provider();

  // useCheckApproval hook'unu kullan
  const checkApproval = useCheckApproval(provider, CONTRACT_ADDRESS);

  // useApproveNFT hook'unu kullan
  const approveNFT = useApproveNFT(signer, CONTRACT_ADDRESS);

  // useCancelAuction hook'unu kullan
  const cancelAuction = useCancelNFTAuction(signer, CONTRACT_ADDRESS);

  // useCancelNFTSale hook'unu kullan
  const cancelNFTSale = useCancelNFTSale(signer, provider, CONTRACT_ADDRESS);

  // useNFTActions hook'unu kullan
  const { startNFTSale } = useNFTActions(signer, provider, CONTRACT_ADDRESS);

  const sellNFT = async (nft) => {
    const contractAddress = nft.contract.address;
    const tokenId = nft.tokenId;
    const nftType = nft.tokenType === "ERC721" ? 0 : 1; 
    console.log(nftType);

    const isApproved = await checkApproval(nftType, contractAddress, tokenId);
    console.log(isApproved);
    if (!isApproved) {
      await approveNFT(contractAddress, tokenId);
    }

    const price = enteredPrices[tokenId];
    if (!price || isNaN(parseFloat(price))) {
      toast.error("Please enter a valid ETH value");
      return;
    }

    try {
      await startNFTSale(nft, price);
      onSellModalClose();
      setUnlistedNfts(unlistedNfts.filter((n) => n.tokenId !== nft.tokenId));
    } catch (error) {
      console.error("Error starting NFT sale:", error);
      toast.error("Error starting NFT sale");
    }
  };

  const { startNFTAuction } = useAuctionActions(
    signer,
    provider,
    CONTRACT_ADDRESS
  );

  const startAuction = async (nft) => {
    const contractAddress = nft.contract.address;
    const tokenId = nft.tokenId;

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
      const isApproved = await checkApproval(contractAddress, tokenId);
      if (!isApproved) {
        await approveNFT(contractAddress, tokenId);
      }

      await startNFTAuction(nft, price, unixTimestampStart, unixTimestampEnd);
      onAuctionModalClose();
      setUnlistedNfts(unlistedNfts.filter((n) => n.tokenId !== nft.tokenId));
    } catch (error) {
      console.error("Error starting auction:", error);
      toast.error("Error starting auction");
    }
  };

  // Unlisted NFT'leri yüklemek için yeni bir fonksiyon
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

  // Buton tıklama işlevini güncelle
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
    // Cüzdan bağlı değilse hata mesajı göster
    return (
      <Box w="100%" p={5} textAlign="center">
        <Text fontSize="xl" color="red.500">
          You need to connect your wallet to access this page.
        </Text>
      </Box>
    );
  }

  if (loadingListedSale) return <Text>Loading NFTs...</Text>;
  if (errorListedSale)
    return <Text>Error loading NFTs: {errorListedSale.message}</Text>;

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
                width="100vw"
                height="90vh"
                display="flex"
                justifyContent="center"
              >
                <Image
                  mt="5"
                  src={NoNftAuction}
                  alt="No Nft For Sale"
                  width="50%"
                  height="50%" // Adjust height accordingly if needed
                  objectFit="contain" // Use "cover" if you want the image to cover the area completely
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
                      boxSize="300px" // Resim boyutu
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
                        {latestBids[nft.Contract_id]
                          ? `${formatEther(
                              latestBids[nft.Contract_id].amount
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
                width="100vw"
                height="90vh"
                display="flex"
                justifyContent="center"
              >
                <Image
                  mt="5"
                  src={NoNftSale}
                  alt="No Nft For Sale"
                  width="50%"
                  height="50%" // Adjust height accordingly if needed
                  objectFit="contain" // Use "cover" if you want the image to cover the area completely
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
                    boxSize="300px" // Resim boyutu
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
                        onClick={() => cancelNFTSale(nft.Contract_id)}
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
              <Text>Loading...</Text>
            ) : unlistedNfts.length === 0 ? (
              <Box
                width="100vw"
                height="90vh"
                display="flex"
                justifyContent="center"
              >
                <Image
                  mt="5"
                  src={NoNftWallet}
                  alt="No Nft For Sale"
                  width="50%"
                  height="50%" // Adjust height accordingly if needed
                  objectFit="contain" // Use "cover" if you want the image to cover the area completely
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

      {/* Sell NFT Modal */}
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

      {/* Auction Start Modal */}
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
