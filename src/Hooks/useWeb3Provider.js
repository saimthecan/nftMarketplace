import { useState, useEffect } from "react";
import { BrowserProvider, JsonRpcProvider } from "ethers";

const useWeb3Provider = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
  const [loading, setLoading] = useState(false); // Bağlantı sırasında loading durumu

  useEffect(() => {
    const setupProvider = async () => {
      try {
        setLoading(true);
        let _provider;

        // Eğer tarayıcıda Ethereum cüzdanı mevcut ve cüzdan zaten bağlıysa
        if (typeof window !== "undefined" && window.ethereum && window.ethereum.isConnected()) {
          _provider = new BrowserProvider(window.ethereum);
          setProvider(_provider);

          // Cüzdanla ilişkilendirilmiş bir hesap olup olmadığını kontrol et
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });

          if (accounts.length > 0) {
            // Eğer hesap mevcutsa, signer al
            const _signer = await _provider.getSigner();
            setSigner(_signer);
            console.log("Cüzdan bağlı:", accounts[0]);
          } else {
            console.log("Cüzdan bağlı değil.");
          }

        } else {
          // Aksi halde, Alchemy üzerinden genel bir sağlayıcı kullan
          _provider = new JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`);
          setProvider(_provider);
          setSigner(null); // Genel sağlayıcıda signer yoktur
          console.log("Alchemy genel sağlayıcı kullanılıyor.");
        }
      } catch (error) {
        console.error("Web3 sağlayıcı kurulurken hata oluştu:", error);
      } finally {
        setLoading(false); // Bağlantı işlemi tamamlandı
      }
    };

    setupProvider();
  }, [alchemyApiKey]);

  return { provider, signer, loading };
};

export default useWeb3Provider;
