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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser } from "react-icons/fa";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet as connectWalletAction } from "../ReduxToolkit/walletSlice"; // Import the action from the slice

export const Navbar = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state) => state.wallet.account); // Use useSelector to get the state
  const [isConnected, setIsConnected] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  //CONNECT WALLET FUNCTION
  const connectWallet = async () => {
    await switchToGoerliNetwork();
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        await dispatch(connectWalletAction(address));
        setIsConnected(true);
        localStorage.setItem("walletAddress", address);
      } catch (error) {
        console.error("Kullanıcı reddetti:", error);
      }
    } else {
      console.log("Metamask yüklenmedi. Lütfen Metamask yükleyin.");
    }
  };

  //CONNECT BUTTON FUNCTION
  const handleConnectClick = () => {
    if (wallet) {
      // Cüzdan zaten bağlıysa, kullanıcıya bağlantısını kesip kesmek istemediğini sorun
      if (window.confirm("Cüzdanınızı bağlantısını kesmek istiyor musunuz?")) {
        disconnectWallet();
      }
    } else {
      // Cüzdan bağlı değilse, bağlantı işlemini başlat
      connectWallet();
    }
  };

  //DISCONNECT WALLET FUNCTION
  const disconnectWallet = () => {
    localStorage.removeItem("walletAddress");
    dispatch(connectWalletAction(null)); // Redux'daki cüzdan adresini null olarak ayarla
    setIsConnected(false); // Bağlantının kesildiğini belirtmek için durumu güncelleyin
  };

  //SWITCH TO GOERLI
  const switchToGoerliNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x5" }], // Goerli test ağının chainId'si 0x5'tir.
      });
    } catch (switchError) {
      console.error("Ağ değiştirilirken bir hata oluştu.", switchError);
    }
  };

  useEffect(() => {
    if (isConnected) {
      console.log("Wallet address after action:", wallet);
    }
  }, [isConnected, wallet]); // `wallet` değişkeni bağımlılık olarak eklenir

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        const currentAddress = accounts[0];
        if (currentAddress) {
          const savedAddress = localStorage.getItem("walletAddress");
          if (currentAddress === savedAddress) {
            dispatch(connectWalletAction(currentAddress));
            setIsConnected(true);
          }
        } else {
          setIsConnected(false);
          localStorage.removeItem("walletAddress");
        }
      }
    };

    init();
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const newAddress = accounts[0];
        dispatch(connectWalletAction(newAddress));
        setIsConnected(true); // Bağlantının yapıldığını belirtmek için durumu güncelleyin
        localStorage.setItem("walletAddress", newAddress); // Yeni cüzdan adresini yerel depolamaya kaydedin
      } else {
        // Eğer cüzdan bağlantısı kesildiyse
        setIsConnected(false);
        localStorage.removeItem("walletAddress");
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      // This should be the cleanup function for useEffect
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [dispatch]);

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
            <Image
              src="/logo.png" // Public klasörünüzün içindeki yolu
              alt="LOGO"
              width="50px"
              height="50px"
            />
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
            to="/vote"
            mr={isMobile ? 2.5 : 5}
            color="rgba(0, 0, 0, 0.8)"
            fontWeight="medium"
          >
            Nft Marketplace
          </Link>
          <Link
            as={RouterLink}
            to="/resetvote"
            color="rgba(0, 0, 0, 0.8)"
            fontWeight="medium"
          >
            My Nfts
          </Link>
        </Box>
        <Spacer />
      </Flex>
      <Box>
        {wallet ? (
          <>
            <Box display={isMobile ? "none" : "block"}>
              {/* PC görünümünde gösterilen düğmeler */}

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
                    className="custom-menu-item"
                    onClick={disconnectWallet}
                    color="white"
                    h="auto"
                    p={2}
                    m={0}
                  >
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
            <Box display={isMobile ? "block" : "none"}>
              {/* Mobil görünümde gösterilen kullanıcı simgesi */}
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
        ) : (
          <Button
            colorScheme="teal"
            bg="teal.700"
            variant="solid"
            onClick={handleConnectClick}
            size={isMobile ? "sm" : "md"} // Mobil görünümde buton boyutunu "sm" olarak ayarla
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
