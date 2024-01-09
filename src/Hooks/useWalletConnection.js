// useWalletConnection.js
import { useDispatch } from "react-redux";
import { connectWallet as connectWalletAction } from "../ReduxToolkit/walletSlice";

const useWalletConnection = () => {
  const dispatch = useDispatch();

  const connectWallet = async () => {
    await switchToGoerliNetwork();
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        dispatch(connectWalletAction(address));
        localStorage.setItem("walletAddress", address);
      } catch (error) {
        console.error("User denied wallet access:", error);
      }
    } else {
      console.log("Please install Metamask.");
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

  return { connectWallet, switchToGoerliNetwork };
};

export default useWalletConnection;
