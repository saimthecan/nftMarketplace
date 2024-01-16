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
  VStack,
  HStack,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import nftsale from "../assests/nftsale.png";
import nftauction from "../assests/nftauction.png";
import mynfts from "../assests/mynfts.png";
import { Link as RouterLink } from "react-router-dom";

const Home = () => {
  const sliderSettings = useBreakpointValue({
    base: {
      dots: true,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 5000,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      pauseOnHover: false,
      adaptiveHeight: true,
    },
    md: {
      dots: true,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 5000,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      pauseOnHover: false,
      adaptiveHeight: false, // Keep a fixed height for desktop view
    },
  });

  const boxSize = {
    width: '100vw',
    height: '60vh',
    '@media (min-width: 360px)': {
      width: '90vw',
      height: '75vh',
    },
    '@media (min-width: 375px)': {
      width: '90vw',
      height: '81vh',
    },
    '@media (min-width: 390px)': {
      width: '100vw',
      height: '65vh',
    },
    '@media (min-width: 412px)': {
      width: '100vw',
      height: '60vh',
    },
    '@media (min-width: 430px)': {
      width: '100vw',
      height: '58vh',
    },
  };

  

  return (
    <Container maxW="container.xl" p={5}>
      <Slider {...sliderSettings}>
        {/* Slide 1 */}
        <Box
          mt="10"
          sx={boxSize}
          display="flex"
          bg="rgb(202, 223, 208)"
          justifyContent="center"
          alignItems="center"
          borderRadius="30"
          boxShadow="md"
        >
          {/* Mobile View */}
          <VStack spacing={4} display={{ base: "flex", md: "none" }}>
            <Image
              src={nftsale}
              alt="NFT for sale"
              borderRadius="lg"
              width="full"
              objectFit="contain"
              pl={5}
              pr={5}
              pt={5}
            />
            <Text fontSize="xl">
              <strong>NFT Trading</strong>
            </Text>
            <Text fontSize="lg" pl={5} pr={5}>
              List your NFT in seconds, and if you change your mind, cancel just
              as fast—no hassle. Find and buy NFTs you love. Our process is
              simple and clear. Your security is crucial. Trade confidently with
              our blockchain tech.
            </Text>
            <Button
              as={RouterLink}
              to="/nftlist"
              bg="#363c42"
              color="white"
              _hover={{ bg: "#363c42" }}
            >
              Buy
            </Button>
          </VStack>
          {/* Desktop View */}
          <HStack
            spacing={4}
            display={{ base: "none", md: "flex" }}
            width="full"
            height="100%"
          >
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
                  _hover={{ bg: "#363c42" }}
                >
                  Buy
                </Button>
              </VStack>
            </Box>
            <Flex
              width="55%"
              bg="rgb(202, 223, 208)"
              p={4}
              alignItems="center"
              justifyContent="center"
              maxHeight="100%"
            >
              <Image
                src={nftsale}
                alt="NFT for sale"
                borderRadius="lg"
                width="85%"
                objectFit="contain"
                ml={50}
              />
            </Flex>
          </HStack>
        </Box>

        {/* Repeat for each slide */}
        {/* Slide 2 */}
        <Box
          mt="10"
          sx={boxSize}
          display="flex"
          bg="rgb(202, 223, 208)"
          justifyContent="center"
          alignItems="center"
          borderRadius="30"
          boxShadow="md"
        >
          {/* Mobile View */}
          <VStack spacing={4} display={{ base: "flex", md: "none" }}>
            <Image
              src={nftauction}
              alt="NFT for sale"
              borderRadius="lg"
              width="full"
              objectFit="contain"
              pl={5}
              pr={5}
              pt={5}
            />
            <Text fontSize="xl">
              <strong>NFT Auction</strong>
            </Text>
            <Text fontSize="lg" pl={5} pr={5}>
              Experience the thrill of our NFT auctions. Set your auction's
              start and end times, and if needed, cancel with ease. Participants
              can bid freely, with the highest bid winning the NFT. Simple,
              transparent, and exciting - join the bidding adventure and own
              unique NFTs!
            </Text>
            <Button
              as={RouterLink}
              to="/nftauction"
              bg="#363c42"
              color="white"
              _hover={{ bg: "#363c42" }}
            >
                Auctions Items
            </Button>
          </VStack>
          {/* Desktop View */}
          <HStack
            spacing={4}
            display={{ base: "none", md: "flex" }}
            width="full"
            height="100%"
          >
            <Box
              width="45%"
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
                  _hover={{ bg: "#363c42" }}
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
              maxHeight="100%"
            >
              <Image
                src={nftauction}
                alt="NFT for auction"
                borderRadius="lg"
                width="85%"
                objectFit="contain"
                ml={50}
              />
            </Flex>
          </HStack>
        </Box>

        {/* Slide 3 */}
        <Box
          mt="10"
          sx={boxSize}
          display="flex"
          bg="rgb(202, 223, 208)"
          justifyContent="center"
          alignItems="center"
          borderRadius="30"
          boxShadow="md"
        >
          {/* Mobile View */}
          <VStack spacing={4} display={{ base: "flex", md: "none" }}>
            <Image
              src={mynfts}
              alt="NFT for sale"
              borderRadius="lg"
              width="full"
              objectFit="contain"
              pl={5}
              pr={5}
              pt={5}
            />
            <Text fontSize="xl">
              <strong>My NFTs</strong>
            </Text>
            <Text fontSize="lg" pl={5} pr={5}>
              Explore your NFT collection with our versatile platform. Use
              'Unlisted NFTs' for easy preparation of your digital assets for
              sale or auction. In 'NFTs for Sale' quickly view and manage your
              listed items. For 'NFTs In Auction' effortlessly oversee your NFTs
              in live auctions, giving you full control over the auction
              process.
            </Text>
          </VStack>
          {/* Desktop View */}
          <HStack
            spacing={4}
            display={{ base: "none", md: "flex" }}
            width="full"
            height="100%"
          >
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
                  for sale or auction. In 'NFTs for Sale' quickly view and
                  manage your listed items. For 'NFTs In Auction' effortlessly
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
              maxHeight="100%"
            >
              <Image
                src={mynfts}
                alt="MyNFts"
                borderRadius="lg"
                width="85%"
                objectFit="contain"
                ml={50}
              />
            </Flex>
          </HStack>
        </Box>
      </Slider>
    </Container>
  );
};

export default Home;
