// useWeb3Provider.js
import { useMemo } from "react";
import { Web3Provider } from "@ethersproject/providers";

const useWeb3Provider = () => {
  const provider = useMemo(() => new Web3Provider(window.ethereum), []);
  const signer = useMemo(() => provider.getSigner(), [provider]);
  return { provider, signer };
};

export default useWeb3Provider;
