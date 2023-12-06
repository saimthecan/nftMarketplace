// useAlchemyProvider.js
import { JsonRpcProvider } from "@ethersproject/providers";
import { useMemo } from 'react';

const useAlchemyProvider = () => {
  const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
  const alchemyProvider = useMemo(() => {
    return new JsonRpcProvider(`https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`);
  }, [alchemyApiKey]);

  return alchemyProvider;
};

export default useAlchemyProvider;
