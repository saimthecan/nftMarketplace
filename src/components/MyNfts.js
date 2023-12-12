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
  Grid,
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

const MyNfts = () => {
  const [nfts, setNfts] = useState([]);
  const [enteredPrices, setEnteredPrices] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [auctionStartTime, setAuctionStartTime] = useState(new Date());
  const [auctionEndTime, setAuctionEndTime] = useState(new Date());
  const [displayedList, setDisplayedList] = useState("listed");

  const { nftData, loadingListedSale, errorListedSale } = useUnlistedNftsData();

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

  
  // useCancelNFTSale hook'unu kullan
  const cancelNFTSale = useCancelNFTSale(signer, provider, CONTRACT_ADDRESS);

  // useNFTActions hook'unu kullan
  const { startNFTSale } = useNFTActions(signer, provider, CONTRACT_ADDRESS);

  const sellNFT = async (nft, index) => {
    const contractAddress = nft.contract.address;
    const tokenId = nft.tokenId;

    const isApproved = await checkApproval(contractAddress, tokenId);
    if (!isApproved) {
      await approveNFT(contractAddress, tokenId);
    }

    const uniqueKey = `${index}-${nft.tokenId}`;
    const price = enteredPrices[uniqueKey];
    await startNFTSale(nft, price);
  };

  const { startNFTAuction } = useAuctionActions(
    signer,
    provider,
    CONTRACT_ADDRESS
  );

  const startAuction = async (nft, index) => {
    const price = enteredPrices[`${index}-${nft.tokenId}`];
    const currentTimestamp = Math.floor(Date.now() / 1000); // Şu anki zamanın Unix zaman damgası
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


    const isApproved = await checkApproval(nft.contract.address, nft.tokenId);
    if (!isApproved) {
      await approveNFT(nft.contract.address, nft.tokenId);
    }

    await startNFTAuction(nft, price, unixTimestampStart, unixTimestampEnd);
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
            NFTs for sale
          </Button>
        </Tooltip>

        <Tooltip hasArrow label="Açık Artırmada" placement="top">
          <Button
            ml="2"
            colorScheme={displayedList === "onAuction" ? "blue" : "gray"}
            onClick={() => toggleList("onAuction")}
          >
            Açık Artırmada
          </Button>
        </Tooltip>
      </Flex>
      {displayedList === "myNfts" && nfts.length === 0 && (
        <Text>You have no NFTs</Text>
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
                  <strong>Contract Address:</strong> {nft.contractAddress}
                </Text>
                <Text>
                  <strong>ID:</strong> {nft.tokenId}
                </Text>
                <Text>
                  <strong>Seller:</strong> {nft.seller}
                </Text>
                <Text>
                  <strong>Price:</strong> {formatEther(nft.price)} ETH
                </Text>
                <Button
                  mt={4}
                  colorScheme="red"
                  onClick={() => cancelNFTSale(nft.Contract_id)}
                >
                  Cancel NFT Sale
                </Button>
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
                <Text>{`Name: ${nft.contract.name}`}</Text>
                <Text>{`Description: ${nft.rawMetadata?.description}`}</Text>
                <Text>{`Token ID: ${nft.tokenId}`}</Text>
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
                  colorScheme="blue"
                  onClick={() => {
                    const price = enteredPrices[`${index}-${nft.tokenId}`];
                    if (!price || isNaN(parseFloat(price))) {
                      toast.error("Please enter a valid ETH value");
                    } else {
                      sellNFT(nft, index);
                    }
                  }}
                >
                  Sell NFT
                </Button>

                <Text>
                  <strong>AuctionStartTime</strong>
                </Text>
                <DatePicker
                  onChange={setAuctionStartTime}
                  selected={auctionStartTime}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={1}
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
                  timeIntervals={1}
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
                <Button
                  onClick={() => {
                    const price = enteredPrices[`${index}-${nft.tokenId}`];
                    if (!price || isNaN(parseFloat(price))) {
                      toast.error("Please enter a valid ETH value");
                    } else {
                      startAuction(nft, index);
                    }
                  }}
                >
                  Auction Start
                </Button>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default MyNfts;
