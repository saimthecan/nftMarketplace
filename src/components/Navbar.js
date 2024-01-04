import React, { useState, useEffect } from "react";
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
  Spacer,
  Text
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser } from "react-icons/fa";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet as connectWalletAction } from "../ReduxToolkit/walletSlice";

export const Navbar = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state) => state.wallet.account);
  const [isConnected, setIsConnected] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const connectWallet = async () => {
    await switchToGoerliNetwork();
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        dispatch(connectWalletAction(address));
        setIsConnected(true);
        localStorage.setItem("walletAddress", address);
      } catch (error) {
        console.error("User denied wallet access:", error);
      }
    } else {
      console.log("Please install Metamask.");
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("walletAddress");
    dispatch(connectWalletAction(null));
    setIsConnected(false);
  };

  const handleConnectClick = () => {
    if (wallet) {
      if (window.confirm("Do you want to disconnect your wallet?")) {
        disconnectWallet();
      }
    } else {
      connectWallet();
    }
  };

  const switchToGoerliNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x5" }], // Goerli Test Network's chainId is 0x5
      });
    } catch (switchError) {
      console.error("Error switching network:", switchError);
    }
  };

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsWrongNetwork(chainId !== '0x5');
    }
  };

  const handleChainChanged = (_chainId) => {
    checkNetwork();
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      const newAddress = accounts[0];
      dispatch(connectWalletAction(newAddress));
      setIsConnected(true);
      localStorage.setItem("walletAddress", newAddress);
    } else {
      setIsConnected(false);
      localStorage.removeItem("walletAddress");
    }
  };


  useEffect(() => {
    checkNetwork();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  if (isWrongNetwork) {
    return (
      <Flex align="center" justify="center" height="100vh" width="100%">
        <Box textAlign="center">
          <Text fontSize="xl" color="red.500" mb="4">
            Wrong Network! Please switch to Goerli Test Network.
          </Text>
          <Button colorScheme="teal" onClick={switchToGoerliNetwork}>
            Switch to Goerli Test Network
          </Button>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg="white"
      color="white"
      w="100%"
      px={["2rem", "4rem", "6rem"]}
    >
      <Flex align="center">
        <Box>
          <Link as={RouterLink} to="/">
            <Image src="/logo.png" alt="Logo" width="50px" height="50px" />
          </Link>
        </Box>
        <Box ml={isMobile ? 2 : 10}>
          <Link as={RouterLink} to="/" mr={isMobile ? 2.5 : 5} color="rgba(0, 0, 0, 0.8)" fontWeight="medium">Home</Link>
          <Link as={RouterLink} to="/nftlist" mr={isMobile ? 2.5 : 5} color="rgba(0, 0, 0, 0.8)" fontWeight="medium">Nft Marketplace</Link>
          <Link as={RouterLink} to="/nftauction" color="rgba(0, 0, 0, 0.8)" fontWeight="medium">Auctions</Link>
        </Box>
        <Spacer />
      </Flex>
      <Box>
        {wallet ? (
          <>
            <Box display={isMobile ? "none" : "block"}>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="teal" bg="teal.700" variant="solid" _hover={{ bg: "teal.700" }}>
                  {wallet.substring(0, 8) + "..."}
                </MenuButton>
                <MenuList bg="teal.500" border="none">
                  <MenuItem onClick={disconnectWallet} color="white" h="auto" p={2} m={0}>Disconnect</MenuItem>
                </MenuList>
              </Menu>
            </Box>
            <Box display={isMobile ? "block" : "none"}>
              <Menu>
                <MenuButton as={IconButton} icon={<FaUser />} />
                <MenuList bg="teal.500" border="none">
                  <MenuItem bg="teal.400" onClick={disconnectWallet} color="white">Disconnect</MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </>
        ) : (
          <Button colorScheme="teal" bg="teal.700" variant="solid" onClick={handleConnectClick} size={isMobile ? "sm" : "md"}>Connect</Button>
        )}
      </Box>
    </Flex>
  );
};

const mapStateToProps = (state) => ({
  wallet: state.wallet.account,
});

export default connect(mapStateToProps)(Navbar);
