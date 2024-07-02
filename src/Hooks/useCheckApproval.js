import { ethers } from 'ethers';
import { marketplace } from '../components/marketplace';

const useCheckApproval = (provider, CONTRACT_ADDRESS) => {
  const checkApproval = async (nftType, contractAddress, tokenId, operator, owner) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, marketplace, provider);
      console.log("type", nftType);
      console.log("contractAddress", contractAddress);
      console.log("tokenId", tokenId);
      console.log("operator", operator);
      console.log("owner", owner);
      const isApproved = await contract.isTokenApproved(nftType, contractAddress, tokenId, operator, owner);
     
      return isApproved;
    } catch (error) {
      console.error("Error checking NFT approval:", error);
      return false;
    }
  };

  return checkApproval;
};

export default useCheckApproval;