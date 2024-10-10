// useClaimNFT.js
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from '../../abi/marketplace';  // Marketplace kontratı

const useClaimNFTAuction = (signer, CONTRACT_ADDRESS) => {
  const claimNFT = async (nft) => {
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );

    try {
      const tx = await marketplaceContract.finishNFTAuction(nft.NFTMarketplace_id);
      await signer.provider.waitForTransaction(tx.hash, 1);
      toast.success("Auction finished successfully!");
    } catch (error) {
      console.error("An error occurred while finishing the auction:", error);
      toast.error("Error finishing auction.");
    }
  };

  return claimNFT;
};

export default useClaimNFTAuction;
