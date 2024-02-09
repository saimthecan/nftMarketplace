import { ethers } from 'ethers';
import { marketplace } from '../components/marketplace';

const useCheckApproval = (provider, CONTRACT_ADDRESS) => {
  const checkApproval = async (nftType, contractAddress, tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, marketplace, provider);
      console.log("type", nftType);
      console.log("contractAddress", contractAddress);
      console.log("tokenId", tokenId);
      console.log("CONTRACT_ADDRESS", CONTRACT_ADDRESS);
      const isApproved = await contract.isTokenApproved(nftType, contractAddress, tokenId, CONTRACT_ADDRESS);
     
      return isApproved;
    } catch (error) {
      console.error("Error checking NFT approval:", error);
      return false;
    }
  };

  return checkApproval;
};

export default useCheckApproval;