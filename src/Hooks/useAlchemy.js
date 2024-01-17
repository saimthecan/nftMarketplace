// useAlchemy.js
import { useMemo } from 'react';
import { Network, Alchemy } from "alchemy-sdk";

const useAlchemy = () => {
  // Alchemy nesnesini ve ayarlarını oluştur
  const alchemy = useMemo(() => {
    const settings = {
      apiKey: process.env.REACT_APP_ALCHEMY_API_KEY ,
      network: Network.ETH_SEPOLIA,
    };

    return new Alchemy(settings);
  }, []); 

  return alchemy;
};

export default useAlchemy;
