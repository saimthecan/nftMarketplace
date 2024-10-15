import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Text,
  Image,
  Grid,
  Button,
  Flex,
  Select,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
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
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";
import NftEmpty from "./NftEmpty";

const NFTList = () => {
  const wallet = useSelector((state) => state.wallet.account);
  const { connectWallet, switchToSepoliaNetwork } = useWalletConnection();
  const { nftImages, nftDetails, unsoldNFTs } = useNFTListData();
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);

  const [loadingImages, setLoadingImages] = useState({});
  const imageBoxSize = useBreakpointValue({ base: "300px", md: "250px" });

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

  const gridTemplateColumns = useBreakpointValue({
    base: "1fr", // Mobilde tek sütun
    md: "repeat(auto-fill, minmax(300px, 0.2fr))", // Masaüstünde grid düzeni
  });

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleImageLoad = (uniqueKey) => {
    setLoadingImages((prevLoading) => ({
      ...prevLoading,
      [uniqueKey]: false, // Resim yüklendiğinde 'false' yapıyoruz
    }));
  };

  //Helper function to buy Nft
  const buyNFT = useBuyNFT(signer, provider, CONTRACT_ADDRESS, balance);

  // useCancelNFTSale hook'unu kullan
  const cancelNFTSale = useCancelNFTSale(signer, provider, CONTRACT_ADDRESS);

  if (loadingListedSale || loadingSold) return <LoadingSpinner />;
  if (errorListedSale || errorSold)
    return `Error! ${errorListedSale?.message || errorSold?.message}`;

  const text =
    "Shelves are empty, and so is our spirit...<br /> Maybe an NFT would bring a little joy. 😢";
  const imageSrc = noNft; // Farklı bir resim

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
          <Text fontSize="lg" fontWeight="bold">
            Sort Price:
          </Text>
          {/* Daha belirgin ve ilgi çekici simge */}
          <Flex
            align="center"
            justify="center"
            w={8} // Genişlik
            h={8} // Yükseklik
            borderRadius="full" // Yuvarlak arka plan
            bg="gray.200" // Arka plan rengi
            cursor="pointer"
            onClick={toggleSortOrder}
            transition="background-color 0.3s, color 0.3s"
          >
            <Icon
              as={sortOrder === "asc" ? ChevronUpIcon : ChevronDownIcon}
              w={6} // Simge genişliği
              h={6} // Simge yüksekliği
              color="blue.600"
            />
          </Flex>
        </Flex>

        {/* Kategori Bölümü */}
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
            {Array.from(
              new Set(
                unsoldNFTs.map((nft) => {
                  const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
                  return nftDetails[uniqueKey]?.name || "Unknown";
                })
              )
            ).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>

      <Grid
        templateColumns={gridTemplateColumns}
        mb={10}
        justifyContent="center" // Kartları yatay olarak ortalar
        alignItems="center" // Kartları dikey olarak ortalar
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
              m="auto"
              mb="1rem"
            >
              <Image
                src={nftImages[uniqueKey] || noImage}
                alt={`NFT ${nft.tokenId}`}
                boxSize={imageBoxSize}
                objectFit="cover" // Görselin boyutlandırılmasını ayarlayın
                borderRadius="md" // Görselin köşelerini yuvarlatın
                mx="auto"
                onLoad={() => handleImageLoad(uniqueKey)} // Resim yüklendiğinde state'i günceller
                display={loadingImages[uniqueKey] === false ? "block" : "none"} // Yükleme bitince göster
              />

              <Box p={4}>
                {/* NFT Başlığı */}
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  {nftDetails[uniqueKey]?.name}
                </Text>

                {/* Açıklama ve Yaratıcı Bilgileri */}
                <Text fontSize="sm" color="gray.600" mb={1}>
                  <strong>Description:</strong>{" "}
                  {nftDetails[uniqueKey]?.description}
                </Text>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  <strong>Created By:</strong>{" "}
                  {nftDetails[uniqueKey]?.createdBy}
                </Text>

                {/* Fiyat Bilgisi */}
                <Box mt={2}>
                  <Flex justify="flex-start" align="center" mb={1}>
                    <Text fontWeight="bold">Price:</Text>
                    <Text ml={1}>{formatEther(nft.price)} ETH</Text>{" "}
                    {/* Fiyatın biraz boşluk ile ayrılmasını sağladık */}
                  </Flex>
                </Box>
              </Box>

              {/* Aksiyon Butonları */}
              {wallet ? (
                !isWrongNetwork ? (
                  nft.seller.toLowerCase() === account?.toLowerCase() ? (
                    <Button
                      bg="red.500"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      _active={{ bg: "red.700" }}
                      onClick={() => cancelNFTSale(nft.NFTMarketplace_id)}
                      w="full"
                      borderRadius="full"
                    >
                      Cancel NFT Sale
                    </Button>
                  ) : (
                    <Button
                      bg="blue.500"
                      color="white"
                      _hover={{ bg: "blue.600" }}
                      _active={{ bg: "blue.700" }}
                      onClick={() => buyNFT(nft.NFTMarketplace_id, nft.price)}
                      w="full"
                      borderRadius="full"
                    >
                      Buy NFT
                    </Button>
                  )
                ) : (
                  <Button
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    _active={{ bg: "red.700" }}
                    onClick={switchToSepoliaNetwork}
                    w="full"
                    borderRadius="full"
                  >
                    Switch to Sepolia
                  </Button>
                )
              ) : (
                <Button
                  bg="teal.500"
                  color="white"
                  _hover={{ bg: "teal.600" }}
                  _active={{ bg: "teal.700" }}
                  onClick={connectWallet}
                  w="full"
                  borderRadius="full"
                >
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
