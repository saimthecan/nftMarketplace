import { useCallback } from 'react';
import { ethers } from "ethers";

const useNFTMetadata = (alchemyProvider) => {
  const getNFTMetadata = useCallback(
    async (contractAddress, tokenId) => {
      const contract = new ethers.Contract(
        contractAddress,
        ["function tokenURI(uint256 tokenId) external view returns (string memory)"],
        alchemyProvider
      );
      const tokenUri = await contract.tokenURI(tokenId);
      const response = await fetch(tokenUri);
      const metadata = await response.json();
      return metadata;
    },
    [alchemyProvider]
  );

  return getNFTMetadata;
};

export default useNFTMetadata;
