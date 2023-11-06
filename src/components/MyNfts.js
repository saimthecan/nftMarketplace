import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Image, Badge, Button, Input } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Network, Alchemy } from "alchemy-sdk";
import noImage from "../assests/noImage.png";
import { ERC721 } from "./erc721abi";
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { parseEther } from "ethers/utils";
import { marketplace } from "./marketplace";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const MyNfts = () => {
  const [nfts, setNfts] = useState([]);
  const [enteredPrices, setEnteredPrices] = useState({});
  const [enteredQuantities, setEnteredQuantities] = useState({});
  const [auctionStartTime, setAuctionStartTime] = useState(new Date());
  const [auctionEndTime, setAuctionEndTime] = useState(new Date());
  const wallet = useSelector((state) => state.wallet.account);
  const CONTRACT_ADDRESS = "0xDaC2C5D1BD3265740Ed7bdFc5b8948Cc41aC4972";
  const settings = {
    apiKey: "4fzUXD3ZGkDM_iosciExOfbF_4V0blFV",
    network: Network.ETH_GOERLI,
  };

  const alchemy = new Alchemy(settings);
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const NFTType = {
    ERC721: 0,
    ERC1155: 1,
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
      console.log("NFT sale started successfully!");
    } catch (error) {
      console.error("An error occurred while starting the NFT sale:", error);
    }
  };

  const checkApproval = async (contractAddress, tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ERC721, provider);
      const approvedAddress = await contract.getApproved(tokenId);
      return approvedAddress === CONTRACT_ADDRESS;
    } catch (error) {
      console.error("An error occurred while checking approval status:", error);
    }
    return false;
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
   
    console.log(unixTimestampStart)
    console.log(unixTimestampEnd)
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
      console.log("NFT auction started successfully!");
    } catch (error) {
      console.error("An error occurred while starting the NFT auction:", error);
    }
  };

  const startAuction = async (nft, index) => {
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
    await startNFtAuction(nft, index);
  };

  useEffect(() => {
    if (wallet) {
      alchemy.nft.getNftsForOwner(wallet).then((nftsForOwner) => {
        setNfts(nftsForOwner.ownedNfts);
      });
    }
  }, [wallet, alchemy.nft]);

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
      <Flex wrap="wrap">
        {nfts.length === 0 ? (
          <Text>You have no NFTs</Text>
        ) : (
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
              <Text
                mt={2}
              >{`Description: ${nft.rawMetadata?.description}`}</Text>
              <Text mt={2}>{`Token ID: ${nft.tokenId}`}</Text>
              <Input
                type="number"
                placeholder="Enter listing price in ETH"
                value={enteredPrices[`${index}-${nft.tokenId}`] || ""} // Benzersiz anahtar ile fiyatı al
                onChange={(e) =>
                  setEnteredPrices((prevPrices) => ({
                    ...prevPrices,
                    [`${index}-${nft.tokenId}`]: e.target.value, // Benzersiz anahtar ile fiyatı güncelle
                  }))
                }
              />
              <Button
                mt={4}
                ml={2}
                colorScheme="blue"
                onClick={() => sellNFT(nft, index)} // sellNFT fonksiyonunu çağırın
              >
                Sell NFT
              </Button>
              <DatePicker
                onChange={setAuctionStartTime}
                value={auctionStartTime}
            />
            <DatePicker
                onChange={setAuctionEndTime}
                value={auctionEndTime}
            />
            <Button onClick={() => startAuction(nft, index)}>Auction Start</Button>
            </Box>
          ))
        )}
      </Flex>
    </Box>
  );
};

export default MyNfts;
