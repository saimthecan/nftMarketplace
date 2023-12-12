// useApproveNFT.js
import { ethers } from 'ethers';
import { ERC721 } from '../components/erc721abi'; // ERC721 ABI yolu doğru olmalı
import { toast } from 'react-toastify';

const useApproveNFT = (signer, CONTRACT_ADDRESS) => {
  const approveNFT = async (contractAddress, tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ERC721, signer);
      const approvalTx = await contract.approve(CONTRACT_ADDRESS, tokenId);
      await signer.provider.waitForTransaction(approvalTx.hash, 1);
      toast.success("NFT approved successfully");
    } catch (error) {
      toast.error("Error approving NFT");
      console.error("Error approving NFT:", error);
    }
  };

  return approveNFT;
};

export default useApproveNFT;
