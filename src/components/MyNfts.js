import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Badge,
  Button,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Network, Alchemy } from "alchemy-sdk";
import noImage from "../assests/noImage.png";
import { ERC721 } from "./erc721abi";
import { Web3Provider } from "@ethersproject/providers";
import { useQuery } from "@apollo/client";
import { GET_LISTED_NFTS_FOR_AUCTION } from "../queries/nftQueries";
import client from "../config/apolloClient";
import { ethers } from "ethers";
import { parseEther } from "ethers/utils";
import { marketplace } from "./marketplace";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const MyNfts = () => {
  const [nfts, setNfts] = useState([]);
  const [nftImages, setNftImages] = useState({});
  const [enteredPrices, setEnteredPrices] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [userAddress, setUserAddress] = useState(null);
  const [auctionStartTime, setAuctionStartTime] = useState(new Date());
  const [auctionEndTime, setAuctionEndTime] = useState(new Date());
  const [displayedList, setDisplayedList] = useState("listed");
  const {
    loading: loadingListed,
    error: errorListed,
    data: dataListed,
  } = useQuery(GET_LISTED_NFTS_FOR_AUCTION, { client, pollInterval: 5000 });
  const wallet = useSelector((state) => state.wallet.account);
  const CONTRACT_ADDRESS = "0x548d43c9a6f0d13a22b3196a727b36982602ca22";
  const settings = {
    apiKey: "4fzUXD3ZGkDM_iosciExOfbF_4V0blFV",
    network: Network.ETH_GOERLI,
  };

  const alchemy = new Alchemy(settings);
  const provider = useMemo(() => new Web3Provider(window.ethereum), []);
  const signer = provider.getSigner();

  const NFTType = {
    ERC721: 0,
    ERC1155: 1,
  };

  // Function to toggle the displayed list
  const toggleList = (list) => {
    setDisplayedList(list);
  };

  const approveNFT = async (contractAddress, tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ERC721, signer);
      const approvalTx = await contract.approve(
        CONTRACT_ADDRESS.toString(),
        tokenId
      );
      console.log("Approval transaction sent:", approvalTx.hash);

      // İşlemin onaylanmasını bekleyin
      const receipt = await provider.waitForTransaction(approvalTx.hash, 1); // İşlemin tamamlanmasını bekleyin
      console.log("Approval transaction confirmed:", receipt.transactionHash);
    } catch (error) {
      console.error("An error occurred while approving the NFT:", error);
    }
  };

  const startNFTSale = async (nft, index) => {
    const uniqueKey = `${index}-${nft.tokenId}`;
    const priceInEth = enteredPrices[uniqueKey];
    const priceInWei = parseEther(priceInEth.toString());
    const contractAddress = nft.contract.address;

    const nftType =
      nft.tokenType === "ERC721" ? NFTType.ERC721 : NFTType.ERC1155;
    const quantity =
      nft.tokenType === NFTType.ERC1155
        ? enteredQuantities[nft.tokenId] || 1
        : 1;

    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );

    try {
      const tx = await marketplaceContract.startNFTSale(
        nftType,
        contractAddress,
        priceInWei,
        nft.tokenId,
        quantity
      );
      await provider.waitForTransaction(tx.hash, 1); // İşlemin tamamlanmasını bekleyin
      toast.success("NFT sale started successfully!")
      console.log("NFT sale started successfully!");
    } catch (error) {
      console.error("An error occurred while starting the NFT sale:", error);
    }
  };

  const checkApproval = async (contractAddress, tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ERC721, provider);
      const approvedAddress = await contract.getApproved(tokenId);
      const isApproved =
        approvedAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase();
      return isApproved;
    } catch (error) {
      console.error("An error occurred while checking approval status:", error);
      return false;
    }
  };

  

  const sellNFT = async (nft, index) => {
    const contractAddress = nft.contract.address;
    const tokenId = nft.tokenId;
    console.log(nft);
    // Onay durumunu kontrol edin
    const isApproved = await checkApproval(contractAddress, tokenId);
    if (!isApproved) {
      // Eğer onaylanmadıysa, NFT'yi onaylayın
      await approveNFT(contractAddress, tokenId);
      // İşlemin onaylanmasını bekleyin (işlemin onaylanmasını beklemek için bir yöntem eklemelisiniz)
      // ...
    }

    // NFT satışını başlatın
    await startNFTSale(nft, index);
  };
  const startNFtAuction = async (nft, index) => {
    const uniqueKey = `${index}-${nft.tokenId}`;
    const priceInEth = enteredPrices[uniqueKey];
    const unixTimestampStart = Math.floor(auctionStartTime.getTime() / 1000);
    const unixTimestampEnd = Math.floor(auctionEndTime.getTime() / 1000);
    const priceInWei = parseEther(priceInEth.toString());

    const contractAddress = nft.contract.address;

    const nftType =
      nft.tokenType === "ERC721" ? NFTType.ERC721 : NFTType.ERC1155;
    const quantity =
      nft.tokenType === NFTType.ERC1155
        ? enteredQuantities[nft.tokenId] || 1
        : 1;

    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );

    console.log(unixTimestampStart);
    console.log(unixTimestampEnd);
    try {
      const tx = await marketplaceContract.startNFTAuction(
        nftType,
        contractAddress,
        priceInWei,
        nft.tokenId,
        quantity,
        unixTimestampStart,
        unixTimestampEnd
      );
      await provider.waitForTransaction(tx.hash, 1); // İşlemin tamamlanmasını bekleyin
      toast.success("NFT auction started successfully!")
      console.log("NFT auction started successfully!");
    } catch (error) {
      console.error("An error occurred while starting the NFT auction:", error);
    }
  };

  const startAuction = async (nft, index) => {
    const contractAddress = nft.contract.address;
    const tokenId = nft.tokenId;
    const currentTimestamp = Math.floor(Date.now() / 1000); // Şu anki zamanın Unix zaman damgası
    const unixTimestampStart = Math.floor(auctionStartTime.getTime() / 1000);
    const unixTimestampEnd = Math.floor(auctionEndTime.getTime() / 1000);

     // Başlangıç zamanının şu anki zamandan sonra ve bitiş zamanının başlangıç zamanından sonra olmasını kontrol edin
  if (unixTimestampStart <= currentTimestamp) {
    toast.error("Auction start time must be in the future.");
    return;
  }
  if (unixTimestampEnd <= unixTimestampStart) {
    toast.error("Auction end time must be after the start time.");
    return;
  }
    console.log(nft);
    // Onay durumunu kontrol edin
    const isApproved = await checkApproval(contractAddress, tokenId);
    if (!isApproved) {
      // Eğer onaylanmadıysa, NFT'yi onaylayın
      await approveNFT(contractAddress, tokenId);
      // İşlemin onaylanmasını bekleyin (işlemin onaylanmasını beklemek için bir yöntem eklemelisiniz)
      // ...
    }

    // NFT satışını başlatın
    await startNFtAuction(nft, index);
  };
  // NFT metadata'yı çeken fonksiyon
  const getNFTMetadata = useCallback(
    async (contractAddress, tokenId) => {
      const contract = new ethers.Contract(contractAddress, ERC721, provider);
      const tokenUri = await contract.tokenURI(tokenId);
      const response = await fetch(tokenUri);
      const metadata = await response.json();
      return metadata;
    },
    [provider]
  );

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

  useEffect(() => {
    let isMounted = true; // Bellek sızıntısını önlemek için flag

    const fetchNFTMetadata = async () => {
      if (dataListed && dataListed.nftlistedForAuctions) {
        const promises = dataListed.nftlistedForAuctions.map((nft) =>
          getNFTMetadata(nft.contractAddress, nft.tokenId)
        );

        try {
          const metadataList = await Promise.all(promises);
          if (isMounted) {
            setNftImages(
              metadataList.reduce(
                (acc, metadata, index) => ({
                  ...acc,
                  [dataListed.nftlistedForAuctions[index].tokenId]:
                    metadata.image,
                }),
                {}
              )
            );
          }
        } catch (error) {
          console.error("Error fetching NFT metadata:", error);
        }
      }
    };

    fetchNFTMetadata();

    return () => {
      isMounted = false;
    }; // Cleanup function
  }, [dataListed, getNFTMetadata]);

  useEffect(() => {
    if (wallet) {
      alchemy.nft.getNftsForOwner(wallet).then((nftsForOwner) => {
        setNfts(nftsForOwner.ownedNfts);
      });
    }
  }, [wallet, alchemy.nft]);

  useEffect(() => {
    // Açık artırma listesi güncellendiğinde bu kod çalışacak
    if (displayedList === "onAuction") {
      // dataListed içindeki nftlistedForAuctions'dan sadece cüzdan adresi ile eşleşen NFT'leri filtreleyin
      const filteredAuctionNfts = dataListed?.nftlistedForAuctions.filter(
        (nft) => nft.seller === wallet
      );

      // Filtrelenmiş NFT'lerle state'i güncelleyin
      setNfts(filteredAuctionNfts);
    }
  }, [displayedList, dataListed, wallet]);

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
        <Tooltip hasArrow label="Benim NFT'lerim" placement="top">
          <Button
            colorScheme={displayedList === "myNfts" ? "blue" : "gray"}
            onClick={() => setDisplayedList("myNfts")}
          >
            Benim NFT'lerim
          </Button>
        </Tooltip>
        <Tooltip hasArrow label="Listelenenler" placement="top">
          <Button
            colorScheme={displayedList === "listed" ? "blue" : "gray"}
            onClick={() => toggleList("listed")}
          >
            Listelenenler
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
      {displayedList === "myNfts" &&
        nfts.map((nft, index) => (
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
            <Text mt={2}>{`Name: ${nft.contract.name}`}</Text>
            <Text mt={2}>{`Description: ${nft.rawMetadata?.description}`}</Text>
            <Text mt={2}>{`Token ID: ${nft.tokenId}`}</Text>
            {/* Diğer NFT aksiyon butonları ve inputları burada yer alacak */}
          </Box>
        ))}

      {displayedList === "listed" && (
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
                <Button onClick={() => {
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

      {displayedList === "onAuction" && (
        <Flex wrap="wrap">
          {loadingListed ? (
            <Text>Loading...</Text>
          ) : errorListed ? (
            <Text>Error: {errorListed.message}</Text>
          ) : (
            nfts &&
            nfts.map((nft, index) => {
              // Burada her bir NFT'yi konsola yazdır
              console.log("Auction NFT:", nft);

              // NFT'yi görselleştirmek için devam eden JSX
              return (
                <Box
                  key={index}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  boxShadow="md"
                  m={2}
                >
                  {nftImages[nft.tokenId] && (
                    <Image
                      boxSize="300px"
                      src={nftImages[nft.tokenId]}
                      alt="NFT Image"
                      mt={4}
                    />
                  )}
                  <Text>{`Token ID: ${nft.tokenId}`}</Text>

                  <Text>{`Satıcı: ${nft.seller}`}</Text>
                  <Button
                    colorScheme="red"
                    onClick={() => cancelAuction(nft, index)}
                  >
                    Cancel Auction
                  </Button>
                </Box>
              );
            })
          )}
        </Flex>
      )}
    </Box>
  );
};

export default MyNfts;
