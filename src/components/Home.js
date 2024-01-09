import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Box,
  Text,
  Container,
  Image,
  Button,
  Flex,
  HStack,
  VStack,
} from "@chakra-ui/react";
import nftsale from "../assests/nftsale.png";
import nftauction from "../assests/nftauction.png";
import mynfts from "../assests/mynfts.png";
import { Link as RouterLink } from "react-router-dom";

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  return (
    <Container maxW="container.xl" p={5}>
      <Slider {...settings}>
        <Box
          mt="10"
          width="100vw"
          height="65vh"
          display="flex"
          bg="rgb(202, 223, 208)"
          justifyContent="center"
          alignItems="center"
          borderRadius="30"
          boxShadow="md"
        >
          <HStack spacing={4} width="full" height="100%">
            <Box
              width="40%"
              p={4}
              borderRadius="lg"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <VStack spacing={4} width="full" align="stretch">
                <Text fontSize="4xl" ml="50px">
                  <strong>NFT Trading</strong>
                </Text>
                <Text fontSize="md" ml="50px">
                  List your NFT in seconds, and if you change your mind, cancel
                  just as fast—no hassle. Find and buy NFTs you love. Our
                  process is simple and clear. Your security is crucial. Trade
                  confidently with our blockchain tech.
                </Text>
                <Button
                  as={RouterLink}
                  to="/nftlist"
                  ml="50px"
                  w="152px"
                  h="48px"
                  bg="#363c42"
                  color="white"
                >
                  Buy and Sell
                </Button>
              </VStack>
            </Box>
            <Flex
              width="55%"
              bg="rgb(202, 223, 208)"
              p={4}
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src={nftsale}
                alt="NFT"
                borderRadius="lg"
                maxHeight="100%"
                alignSelf="center"
                objectFit="contain"
              />
            </Flex>
          </HStack>
        </Box>

        <Box
          mt="10"
          width="100vw"
          height="65vh"
          display="flex"
          bg="rgb(202, 223, 208)"
          justifyContent="center"
          alignItems="center"
          borderRadius="30"
          boxShadow="md"
        >
          <HStack spacing={4} width="full" height="100%">
            <Box
              width="40%"
              p={4}
              borderRadius="lg"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <VStack spacing={4} width="full" align="stretch">
                <Text fontSize="4xl" ml="50px">
                  <strong>NFT Auction</strong>
                </Text>
                <Text fontSize="md" ml="50px">
                  Experience the thrill of our NFT auctions. Set your auction's
                  start and end times, and if needed, cancel with ease.
                  Participants can bid freely, with the highest bid winning the
                  NFT. Simple, transparent, and exciting - join the bidding
                  adventure and own unique NFTs!
                </Text>
                <Button
                  as={RouterLink}
                  to="/nftauction"
                  ml="50px"
                  w="152px"
                  h="48px"
                  bg="#363c42"
                  color="white"
                >
                  Auctions Items
                </Button>
              </VStack>
            </Box>
            <Flex
              width="55%"
              bg="rgb(202, 223, 208)"
              p={4}
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src={nftauction}
                alt="NFT"
                borderRadius="lg"
                maxHeight="100%"
                alignSelf="center"
                objectFit="contain"
              />
            </Flex>
          </HStack>
        </Box>

        <Box
          mt="10"
          width="100vw"
          height="65vh"
          display="flex"
          bg="rgb(202, 223, 208)"
          justifyContent="center"
          alignItems="center"
          borderRadius="30"
          boxShadow="md"
        >
          <HStack spacing={4} width="full" height="100%">
            <Box
              width="40%"
              p={4}
              borderRadius="lg"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <VStack spacing={4} width="full" align="stretch">
                <Text fontSize="4xl" ml="50px">
                  <strong>My NFTs</strong>
                </Text>
                <Text fontSize="md" ml="50px">
                  Explore your NFT collection with our versatile platform. Use
                  'Unlisted NFTs' for easy preparation of your digital assets
                  for sale or auction. In 'NFTs for Sale,' quickly view and
                  manage your listed items. For 'On Auctions,' effortlessly
                  oversee your NFTs in live auctions, giving you full control
                  over the auction process.
                </Text>
              </VStack>
            </Box>
            <Flex
              width="55%"
              bg="rgb(202, 223, 208)"
              p={4}
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src={mynfts}
                alt="NFT"
                borderRadius="lg"
                maxHeight="100%"
                alignSelf="center"
                objectFit="contain"
              />
            </Flex>
          </HStack>
        </Box>
      </Slider>
    </Container>
  );
};

export default Home;
