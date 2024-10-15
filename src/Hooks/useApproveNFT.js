import { ethers } from 'ethers';
import { ERC721 } from '../abi/erc721abi'; // ERC721 ABI yolunuz doğru olmalı
import { ERC1155 } from '../abi/erc1155abi'; // ERC1155 ABI yolunuz doğru olmalı
import { toast } from 'react-toastify';

const useApproveNFT = (signer, CONTRACT_ADDRESS) => {
  const approveNFT = async (contractAddress, tokenId, nftType) => {
    try {
      let contract;
      if (nftType === 0) { // ERC721 için
        contract = new ethers.Contract(contractAddress, ERC721, signer);
      } else if (nftType === 1) { // ERC1155 için
        contract = new ethers.Contract(contractAddress, ERC1155, signer);
      } else {
        throw new Error("Unsupported NFT type.");
      }

      // Kullanıcının NFT sahibi olup olmadığını kontrol et
      if (nftType === 0) {
        const ownerAddress = await signer.getAddress();
        const isOwner = (await contract.ownerOf(tokenId)).toLowerCase() === ownerAddress.toLowerCase();
        if (!isOwner) {
          throw new Error("You are not the owner of this NFT.");
        }
        const approvalTx = await contract.approve(CONTRACT_ADDRESS, tokenId);
        await signer.provider.waitForTransaction(approvalTx.hash);
        toast.success("ERC721 NFT approved successfully.");
      } else {
        const ownerAddress = await signer.getAddress();
        const isApprovedForAll = await contract.isApprovedForAll(ownerAddress, CONTRACT_ADDRESS);
        if (!isApprovedForAll) {
          const approvalTx = await contract.setApprovalForAll(CONTRACT_ADDRESS, true);
          await signer.provider.waitForTransaction(approvalTx.hash);
          toast.success("ERC1155 NFT approved successfully.");
        } else {
          toast.info("Approval is already granted for ERC1155.");
        }
      }
    } catch (error) {
      toast.error(`Error approving NFT: ${error.message}`);
      console.error("Error approving NFT:", error);
      throw error; // Hatanın yukarıya fırlatılmasını sağla
    }
  };

  return { approveNFT };
};

export default useApproveNFT;
