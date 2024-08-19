import React, { useEffect } from "react";
import {
  Flex,
  Image,
  Link,
  Box,
  useBreakpointValue,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet as connectWalletAction } from "../ReduxToolkit/walletSlice";
import useWalletConnection from "../Hooks/useWalletConnection";
import { useLocation } from "react-router-dom";

export const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const wallet = useSelector((state) => state.wallet.account);
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    connectWallet,
    disconnectWallet,
    switchToSepoliaNetwork,
    checkNetwork,
  } = useWalletConnection();

  useEffect(() => {
    const savedWalletAddress = sessionStorage.getItem("walletAddress");
    console.log('useEffect [dispatch]: Saved wallet address from sessionStorage:', savedWalletAddress);
    if (savedWalletAddress) {
      dispatch(connectWalletAction(savedWalletAddress));
    }
  }, [dispatch]);

 // Cüzdan bağlantı/disconnect işlemi
 const handleConnectClick = () => {
  console.log('handleConnectClick: Wallet state before action:', wallet ? "Connected" : "Disconnected");
  if (wallet) {
    if (window.confirm("Do you want to disconnect your wallet?")) {
      disconnectWallet();
      console.log('handleConnectClick: Wallet disconnected.');
    }
  } else {
    connectWallet();
    console.log('handleConnectClick: Attempting to connect wallet...');
  }
};

  // Ağ ve cüzdan adresi değişikliklerini dinle
  useEffect(() => {
    const handleChainChanged = (_chainId) => {
      console.log('useEffect [checkNetwork, dispatch]: Chain changed to:', _chainId);
      checkNetwork();
    };

    //cüzdan değiştirme
  
    const handleAccountsChanged = (accounts) => {
      console.log('useEffect [checkNetwork, dispatch]: Accounts changed:', accounts);
      if (accounts.length > 0) {
        const newAddress = accounts[0];
        dispatch(connectWalletAction(newAddress));
        sessionStorage.setItem("walletAddress", newAddress);
      } else {
        sessionStorage.removeItem("walletAddress");
        dispatch(connectWalletAction(null));
      }
    };
    checkNetwork();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [checkNetwork, dispatch]);

  const fontStyle = {
    fontSize: "16px",
    fontFamily: "Inter, sans-serif",
    textDecoration: "none",
    color: "#8c8cb1",
    fontWeight: 500,
  
  };
  const selectedLinkStyle = {
    fontSize: "16px",
    fontFamily: "Inter, sans-serif",
    textDecoration: "none",
    color: "teal",
    fontWeight: 500,
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg="white"
      color="black"
      w="100vw"
      px={["2rem", "4rem", "6rem"]}
    >
      {/* Logo */}
      <Flex
        display={{ base: "block", md: "block" }}
        mr={useBreakpointValue({ base: "auto", md: "unset" })}
      >
        <Link as={RouterLink} to="/">
          <Image src="/logo.png" alt="Logo" boxSize="50px" />
        </Link>
      </Flex>

      {/* Mobil için Hamburger Menü Butonu */}
      <IconButton
        aria-label="Open Menu"
        icon={<HamburgerIcon />}
        onClick={onOpen}
        display={{ base: "block", md: "none" }}
      />

      {/* Drawer Menüsü */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <strong>NFT</strong>
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={4}>
              <Link
                as={RouterLink}
                to="/"
                onClick={onClose}
                style={
                  location.pathname === "/" ? selectedLinkStyle : fontStyle
                }
              >
                Home
              </Link>
              <Link
                as={RouterLink}
                to="/nftlist"
                onClick={onClose}
                style={
                  location.pathname === "/nftlist"
                    ? selectedLinkStyle
                    : fontStyle
                }
              >
                Nft Marketplace
              </Link>
              <Link
                as={RouterLink}
                to="/nftauction"
                onClick={onClose}
                style={
                  location.pathname === "/nftauction"
                    ? selectedLinkStyle
                    : fontStyle
                }
              >
                Auctions
              </Link>
              {wallet && (
                <Link
                  as={RouterLink}
                  to="/mynfts"
                  onClick={onClose}
                  style={
                    location.pathname === "/mynfts"
                      ? selectedLinkStyle
                      : fontStyle
                  }
                >
                  My Nfts
                </Link>
              )}
              <Box>
                {wallet && !isWrongNetwork ? (
                  <>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        colorScheme="teal"
                        bg="teal.700"
                        variant="solid"
                        _hover={{ bg: "teal.700" }}
                      >
                        {wallet.substring(0, 8) + "..."}
                      </MenuButton>
                      <MenuList bg="teal.500" border="none">
                        <MenuItem
                          onClick={disconnectWallet}
                          bg="teal.500"
                          color="white"
                          h="auto"
                          p={1}
                          m={0}
                        >
                          Disconnect
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </>
                ) : isWrongNetwork ? (
                  <Button
                    colorScheme="red"
                    bg="red.500"
                    variant="solid"
                    onClick={switchToSepoliaNetwork}
                    size="sm"
                  >
                    Wrong Network - Switch to Sepolia
                  </Button>
                ) : (
                  <Button
                    colorScheme="teal"
                    bg="teal.700"
                    variant="solid"
                    onClick={handleConnectClick}
                    size="sm"
                  >
                    Connect
                  </Button>
                )}
              </Box>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex display={{ base: "none", md: "flex" }} mr="auto" ml={10}>
        <Link
          as={RouterLink}
          to="/"
          onClick={onClose}
          mr={12}
          style={location.pathname === "/" ? selectedLinkStyle : fontStyle}
        >
          Home
        </Link>
        <Link
          as={RouterLink}
          to="/nftlist"
          onClick={onClose}
          mr={12}
          style={
            location.pathname === "/nftlist" ? selectedLinkStyle : fontStyle
          }
        >
          Nft Marketplace
        </Link>
        <Link
          as={RouterLink}
          to="/nftauction"
          onClick={onClose}
          mr={12}
          style={
            location.pathname === "/nftauction" ? selectedLinkStyle : fontStyle
          }
        >
          Auctions
        </Link>
        {wallet && (
          <Link
            as={RouterLink}
            to="/mynfts"
            onClick={onClose}
            style={
              location.pathname === "/mynfts" ? selectedLinkStyle : fontStyle
            }
          >
            My Nfts
          </Link>
        )}
      </Flex>

      {/* Bağlantı Butonu ve/veya Kullanıcı Menüsü */}
      <Box>
        {wallet && !isWrongNetwork ? (
          <>
            {/* Masaüstü için Wallet Adresi ve Disconnect Butonu */}
            <Menu display={{ base: "none", md: "block" }}>
              <MenuButton
                display={{ base: "none", md: "block" }}
                as={Button}
                rightIcon={<ChevronDownIcon />}
                colorScheme="teal"
                bg="teal.700"
                variant="solid"
                _hover={{ bg: "teal.700" }}
              >
                {wallet.substring(0, 8) + "..."}
              </MenuButton>
              <MenuList
                bg="teal.500"
                border="none"
                display={{ base: "none", md: "block" }}
              >
                <MenuItem
                  onClick={disconnectWallet}
                  bg="teal.500"
                  color="white"
                  h="auto"
                  p={1}
                  m={0}
                >
                  Disconnect
                </MenuItem>
              </MenuList>
            </Menu>
          </>
        ) : isWrongNetwork ? (
          <Button
            colorScheme="red"
            bg="red.500"
            variant="solid"
            onClick={switchToSepoliaNetwork}
            size="md"
            display={{ base: "none", md: "block" }}
          >
            Wrong Network - Switch to Sepolia
          </Button>
        ) : (
          <Button
            colorScheme="teal"
            bg="teal.700"
            variant="solid"
            onClick={handleConnectClick}
            size="md"
            display={{ base: "none", md: "block" }}
          >
            Connect
          </Button>
        )}
      </Box>
    </Flex>
  );
};

const mapStateToProps = (state) => ({
  wallet: state.wallet.account,
});

export default connect(mapStateToProps)(Navbar);
