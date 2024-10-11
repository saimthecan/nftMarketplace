import { useDispatch } from 'react-redux';
import { connectWallet as connectWalletAction } from "../ReduxToolkit/walletSlice";
import { setNetworkStatus } from '../ReduxToolkit/networkSlice';

const useWalletConnection = () => {
  const dispatch = useDispatch();

  const connectWallet = async () => {
    await switchToSepoliaNetwork();
    
    // EIP-6963 desteği ile yeni bir cüzdan sağlayıcı keşfetme
    if (window.ethereum) {
      window.addEventListener('eip6963:announceProvider', async (event) => {
        const provider = event.detail.provider;

        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          const address = accounts[0];
          dispatch(connectWalletAction(address));
          sessionStorage.setItem("walletAddress", address);
        } catch (error) {
          console.error("Cüzdan erişimi reddedildi:", error);
        }
      });

      // Cüzdan keşfetmek için olay tetikleyici
      window.dispatchEvent(new Event("eip6963:requestProvider"));

    } else {
      console.log("Lütfen Metamask veya başka bir cüzdan yükleyin.");
    }
  };

  const disconnectWallet = () => {
    sessionStorage.removeItem("walletAddress");
    dispatch(connectWalletAction(null));
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