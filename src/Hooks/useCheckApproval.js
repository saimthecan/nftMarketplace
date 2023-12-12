// useCheckApproval.js
import { ethers } from 'ethers';
import { ERC721 } from '../components/erc721abi'; // ERC721 ABI yolu doğru olmalı

const useCheckApproval = (provider, CONTRACT_ADDRESS) => {
  const checkApproval = async (contractAddress, tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ERC721, provider);
      const approvedAddress = await contract.getApproved(tokenId);
      return approvedAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase();
    } catch (error) {
      console.error("Error checking NFT approval:", error);
      return false;
    }
  };

  return checkApproval;
};

export default useCheckApproval;
