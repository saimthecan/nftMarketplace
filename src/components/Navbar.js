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
  Spacer,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser } from "react-icons/fa";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet as connectWalletAction } from "../ReduxToolkit/walletSlice";
import useWalletConnection from "../Hooks/useWalletConnection";

export const Navbar = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state) => state.wallet.account);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isWrongNetwork = useSelector((state) => state.network.isWrongNetwork);

  const {
    connectWallet,
    disconnectWallet,
    switchToGoerliNetwork,
    checkNetwork,
  } = useWalletConnection();
 

  useEffect(() => {
    const savedWalletAddress = localStorage.getItem("walletAddress");
    if (savedWalletAddress) {
      dispatch(connectWalletAction(savedWalletAddress));

    }
  }, [dispatch]);

  const handleConnectClick = () => {
    if (wallet) {
      if (window.confirm("Do you want to disconnect your wallet?")) {
        disconnectWallet();
      }
    } else {
      connectWallet();
    }
  };

  useEffect(() => {
    const handleChainChanged = (_chainId) => {
      checkNetwork();
    };


  //cüzdan değiştirme
  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      const newAddress = accounts[0];
      dispatch(connectWalletAction(newAddress));
      localStorage.setItem("walletAddress", newAddress);
    } else {
      localStorage.removeItem("walletAddress");
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
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  };
}, [checkNetwork, dispatch]);

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
          <Link
            as={RouterLink}
            to="/"
            mr={isMobile ? 2.5 : 5}
            color="rgba(0, 0, 0, 0.8)"
            fontWeight="medium"
          >
            Home
          </Link>
          <Link
            as={RouterLink}
            to="/nftlist"
            mr={isMobile ? 2.5 : 5}
            color="rgba(0, 0, 0, 0.8)"
            fontWeight="medium"
          >
            Nft Marketplace
          </Link>
          <Link
            as={RouterLink}
            to="/nftauction"
            mr={isMobile ? 2.5 : 5}
            color="rgba(0, 0, 0, 0.8)"
            fontWeight="medium"
          >
            Auctions
          </Link>
          {wallet && (
            <Link
              as={RouterLink}
              to="/mynfts"
              color="rgba(0, 0, 0, 0.8)"
              fontWeight="medium"
            >
              My Nfts
            </Link>
          )}
        </Box>
        <Spacer />
      </Flex>
      <Box>
        {wallet && !isWrongNetwork ? (
          <>
            <Box display={isMobile ? "none" : "block"}>
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
            </Box>
            <Box display={isMobile ? "block" : "none"}>
              <Menu>
                <MenuButton as={IconButton} icon={<FaUser />} />
                <MenuList bg="teal.500" border="none">
                  <MenuItem
                    bg="teal.400"
                    onClick={disconnectWallet}
                    color="white"
                  >
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </>
        ) : isWrongNetwork ? (
          <Button
            colorScheme="red"
            bg="red.500"
            variant="solid"
            onClick={switchToGoerliNetwork}
            size={isMobile ? "sm" : "md"}
          >
            Wrong Network - Switch to Goerli
          </Button>
        ) : (
          <Button
            colorScheme="teal"
            bg="teal.700"
            variant="solid"
            onClick={handleConnectClick}
            size={isMobile ? "sm" : "md"}
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
