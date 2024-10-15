import { useDispatch } from 'react-redux';
import { connectWallet as connectWalletAction } from "../ReduxToolkit/walletSlice";
import { setNetworkStatus } from '../ReduxToolkit/networkSlice';

const useWalletConnection = () => {
  const dispatch = useDispatch();

  const connectWallet = async () => {
    await switchToSepoliaNetwork();
  
    // Eğer MetaMask mevcutsa
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        dispatch(connectWalletAction(address));
        sessionStorage.setItem("walletAddress", address);
      } catch (error) {
        console.error("Cüzdan erişimi reddedildi:", error);
      }
    } else {
    }
  };

  
  const disconnectWallet = () => {
    sessionStorage.removeItem("walletAddress");
    dispatch(connectWalletAction(null));
  
    // Cüzdan seçimi önbelleğini temizleme
    if (window.ethereum && window.ethereum.clearCachedProvider) {
      window.ethereum.clearCachedProvider();
    }
  };
  

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      dispatch(setNetworkStatus(chainId !== "0xaa36a7"));
    }
  };

  const switchToSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchError) {
      console.error("Ağ değiştirme hatası:", switchError);
    }
  };

  return { connectWallet, disconnectWallet, switchToSepoliaNetwork, checkNetwork };
};

export default useWalletConnection;