// useWeb3Provider.js
import { useState, useEffect } from "react";
import { BrowserProvider, JsonRpcProvider } from "ethers";

const useWeb3Provider = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;

  useEffect(() => {
    const setupProvider = async () => {
      let _provider;
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.isConnected()) {
        // Kullanıcı cüzdanı mevcut ve bağlıysa, onun sağlayıcısını kullan
        _provider = new BrowserProvider(window.ethereum);
        setProvider(_provider);

        // getSigner() artık asenkron, bu yüzden await kullanmalıyız
        const _signer = await _provider.getSigner();
        setSigner(_signer);
      } else {
        // Aksi halde, Alchemy üzerinden genel bir sağlayıcı kullan
        _provider = new JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`);
        setProvider(_provider);
        setSigner(null); // Genel sağlayıcıda signer yoktur
      }
    };

    setupProvider();
  }, [alchemyApiKey]);

  return { provider, signer };
};

export default useWeb3Provider;
