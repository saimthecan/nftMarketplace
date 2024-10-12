import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Text, Image, Grid, Button, Flex, Select, Icon } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { formatEther } from "ethers/utils";
import useQueries from "../Hooks/useQueries";
import useWeb3Provider from "../Hooks/useWeb3Provider";
import useBuyNFT from "../Hooks/NftSale/useBuyNFT";
import useCancelNFTSale from "../Hooks/NftSale/useCancelNFTSale";
import useNFTListData from "../Hooks/NftSale/useNFTListData";
import useWalletConnection from "../Hooks/useWalletConnection";
import noImage from "../assests/noImage.png";
import noNft from "../assests/nonft.png";
import LoadingSpinner from './LoadingSpinner'; 
import Pagination from "./Pagination";
import NftEmpty from './NftEmpty'; 

const NFTList = () => {
  const wallet = useSelector((state) => state.wallet.account);
  const { connectWallet, switchToSepoliaNetwork } = useWalletConnection();
  const { nftImages, nftDetails, unsoldNFTs } = useNFTListData();
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Kategorilendirilmiş ve sıralanmış NFT'leri filtreleme ve sıralama
  const filteredItems = unsoldNFTs.filter((nft) => {
    const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
    const categoryName = nftDetails[uniqueKey]?.name || "Unknown";
    return selectedCategory === "" || categoryName === selectedCategory;
  });



  const sortedItems = filteredItems.sort((a, b) => {
    const priceA = parseFloat(formatEther(a.price));
    const priceB = parseFloat(formatEther(b.price));
    return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
  });

 const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(unsoldNFTs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Redux state'inden account bilgisini al
  const account = useSelector((state) => state.wallet.account);
  const balance = useSelector((state) => state.wallet.balance);

  //Web3 Provider
  const { provider, signer } = useWeb3Provider();

  //Contract Address
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  //queries
  const { loadingListedSale, errorListedSale, loadingSold, errorSold } =
    useQueries();


 

    const toggleSortOrder = () => {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    };
  
    const handleCategoryChange = (e) => {
      setSelectedCategory(e.target.value);
    };

  //Helper function to buy Nft
  const buyNFT = useBuyNFT(signer, provider, CONTRACT_ADDRESS, balance);

  // useCancelNFTSale hook'unu kullan
  const cancelNFTSale = useCancelNFTSale(signer, provider, CONTRACT_ADDRESS);

  if (loadingListedSale || loadingSold)  return <LoadingSpinner />;
  if (errorListedSale || errorSold)
    return `Error! ${errorListedSale?.message || errorSold?.message}`;

  const text =  "Shelves are empty, and so is our spirit...<br /> Maybe an NFT would bring a little joy. 😢";
  const imageSrc = noNft; // Farklı bir resim

   // Eğer listede satılmamış NFT yoksa yeni bileşeni gösteriyoruz.
   if (currentItems.length === 0) {
    return  <NftEmpty text={text} imageSrc={imageSrc} />;
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

<Flex
  width={{ base: "100%", md: "30%" }} // Mobilde %100, masaüstünde %30 genişlik
  justify="flex-start"
  align="center"
  mb={6}
  gap={6}
  bg="white"
  p={4}
  borderRadius="md"
  boxShadow="md"
  flexWrap={{ base: "wrap", md: "nowrap" }} // Mobilde alt alta
>
  {/* Sıralama Bölümü */}
  <Flex align="center" gap={2}>
    <Text fontSize="lg" fontWeight="bold">Sort Price:</Text>
    {/* Daha belirgin ve ilgi çekici simge */}
    <Flex
      align="center"
      justify="center"
      w={8}  // Genişlik
      h={8}  // Yükseklik
      borderRadius="full"  // Yuvarlak arka plan
      bg="gray.200"  // Arka plan rengi
    
      cursor="pointer"
      onClick={toggleSortOrder}
      transition="background-color 0.3s, color 0.3s"
    >
      <Icon
        as={sortOrder === "asc" ? ChevronUpIcon : ChevronDownIcon}
        w={6}  // Simge genişliği
        h={6}  // Simge yüksekliği
        color="blue.600"
      />
    </Flex>
  </Flex>

  {/* Kategori Bölümü */}
  <Flex align="center" gap={2} mt={{ base: 4, md: 0 }}>
    <Text fontSize="lg" fontWeight="bold">Category:</Text>
    <Select value={selectedCategory} onChange={handleCategoryChange} maxW="200px">
      <option value="">All Categories</option>
      {Array.from(new Set(unsoldNFTs.map(nft => {
        const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
        return nftDetails[uniqueKey]?.name || "Unknown";
      }))).map((category) => (
        <option key={category} value={category}>{category}</option>
      ))}
    </Select>
  </Flex>
</Flex>


      <Grid
        templateColumns="repeat(auto-fit, minmax(300px, 0.2fr))"
        gap={0}
        mb={10}
        justifyContent="center"  // Kartları yatay olarak ortalar
        alignItems="center"  // Kartları dikey olarak ortalar
      >
        {currentItems.map((nft) => {
          const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
          return (
            <Box
              key={uniqueKey}
              p={4}
              borderWidth={1}
              borderRadius="md"
              boxShadow="md"
              overflow="auto"
              w="300px"
              mb="2rem"
              m="auto"
            >
              {nftImages[uniqueKey] && (
                <Image
                  src={nftImages[uniqueKey] || noImage}
                  alt={`NFT ${nft.tokenId}`}
                />
              )}
              <Text mt={3}>
                <strong>Name:</strong> {nftDetails[uniqueKey]?.name}
              </Text>
              <Text>
                <strong>Description:</strong>{" "}
                {nftDetails[uniqueKey]?.description}
              </Text>
              <Text>
                <strong>Created By:</strong>{" "}
                {nftDetails[uniqueKey]?.createdBy}
              </Text>
              <Text>
                <strong>Price:</strong> {formatEther(nft.price)} ETH
              </Text>

              {wallet ? (
                !isWrongNetwork ? (
                  nft.seller.toLowerCase() === account?.toLowerCase() ? (
                    <Button
                      mt={4}
                      colorScheme="red"
                      onClick={() => cancelNFTSale(nft.NFTMarketplace_id)}
                    >
                      Cancel NFT Sale
                    </Button>
                  ) : (
                    <Button
                      mt={4}
                      colorScheme="blue"
                      onClick={() => buyNFT(nft.NFTMarketplace_id, nft.price)}
                    >
                      Buy NFT
                    </Button>
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

export default NFTList;