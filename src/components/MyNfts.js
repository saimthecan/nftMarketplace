import React, { useEffect, useState } from "react";
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

const MyNfts = () => {
  const [nfts, setNfts] = useState([]);
  const [enteredPrices, setEnteredPrices] = useState({});
  const [auctionStartTime, setAuctionStartTime] = useState(new Date());
  const [auctionEndTime, setAuctionEndTime] = useState(new Date());
  const [displayedList, setDisplayedList] = useState("unlisted");
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isAuctionModalOpen, setAuctionModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);
  

  const { nftData, loadingListedSale, errorListedSale } = useUnlistedNftsData();
  const { nftDataAuction } = useOnAuctionData();
  const { latestBids } = useSelector(
    (state) => state.nftAuction
  );
  const {  switchToGoerliNetwork } = useWalletConnection();

  

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

    const isApproved = await checkApproval(contractAddress, tokenId);
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
    } catch (error) {
      console.error("Error starting auction:", error);
      toast.error("Error starting auction");
    }
  };

  useEffect(() => {
    if (wallet) {
      alchemy.nft.getNftsForOwner(wallet).then((nftsForOwner) => {
        setNfts(nftsForOwner.ownedNfts);
      });
    }
  }, [wallet, alchemy.nft]);

  // Function to toggle the displayed list
  const toggleList = (list) => {
    setDisplayedList(list);
  };

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
            colorScheme={displayedList === "unlisted" ? "blue" : "gray"}
            onClick={() => toggleList("unlisted")}
          >
            Unlisted NFTs
          </Button>
        </Tooltip>
        <Tooltip placement="top">
          <Button
            colorScheme={displayedList === "nftsforsale" ? "blue" : "gray"}
            onClick={() => setDisplayedList("nftsforsale")}
          >
            NFTs For Sale
          </Button>
        </Tooltip>

        <Tooltip placement="top">
          <Button
            ml="2"
            colorScheme={displayedList === "onAuction" ? "blue" : "gray"}
            onClick={() => toggleList("onAuction")}
          >
           NFTs In Auction
          </Button>
        </Tooltip>
      </Flex>
      {displayedList === "onAuction" && (
  <Flex wrap="wrap">
    {nftDataAuction.map((nft, index) => (
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
          <Text><strong>Name:</strong> {nft.metadata?.name}</Text>
          <Text><strong>Description:</strong> {nft.metadata?.description}</Text>
          <Text><strong>Created By:</strong> {nft.metadata?.created_by}</Text>
          <Text><strong>Auction Start Time:</strong> {new Date(nft.auctionStartTime * 1000).toLocaleString()}</Text>
          <Text><strong>Auction End Time:</strong> {new Date(nft.auctionEndTime * 1000).toLocaleString()}</Text>
          <Text><strong>Starting Price:</strong> {formatEther(nft.startingPrice)} ETH</Text>
          <Text><strong>Last Bid: </strong> {latestBids[nft.Contract_id] ? `${formatEther(latestBids[nft.Contract_id].amount)} ETH` : "No bids yet"}</Text>
          {isWrongNetwork ? (
            <Button mt={4} colorScheme="red" onClick={switchToGoerliNetwork}>
              Wrong Network - Switch to Goerli
            </Button>
          ) : (
            <Button w="150px" mt={4} colorScheme="red" onClick={() => cancelAuction(nft, index)}>
              Cancel NFT Sale
            </Button>
          )}
        </Flex>
      </Box>
    ))}
  </Flex>
)}


      {displayedList === "nftsforsale" && (
        <Flex wrap="wrap">
          {nftData.map((nft, index) => (
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
            <Button mt={4} colorScheme="red" onClick={switchToGoerliNetwork}>
              Wrong Network - Switch to Goerli
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
          ))}
        </Flex>
      )}

{displayedList === "unlisted" && (
  <Flex wrap="wrap">
    {nfts.map((nft, index) => (
      <Box
        key={index}
        p={4}
        borderWidth={1}
        borderRadius="md"
        boxShadow="md"
        m={2}
      >
        <Badge colorScheme="green" ml="1">{`Balance: ${nft.balance}`}</Badge>
        <Image
          boxSize="300px"
          src={nft.rawMetadata?.image || noImage}
          alt="NFT Image"
          mt={4}
        />
        <Flex flexDirection="column" gap={2} mt={2}>
          <Text><strong>Name:</strong> {nft.contract.name}</Text>
          <Text><strong>Description:</strong> {nft.rawMetadata?.description}</Text>
          <Text><strong>Created By:</strong> {nft.rawMetadata?.created_by}</Text>
        </Flex>
        {isWrongNetwork ? (
          <Button mt={4} colorScheme="red" onClick={switchToGoerliNetwork}>
            Wrong Network - Switch to Goerli
          </Button>
        ) : (
          <Flex mt={4}>
            <Button w="150px" colorScheme="blue" onClick={() => onSellModalOpen(nft)}>
              Sell
            </Button>
            <Button w="150px" colorScheme="green" onClick={() => onAuctionModalOpen(nft)}>
              Auction
            </Button>
          </Flex>
        )}
      </Box>
    ))}
  </Flex>
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
