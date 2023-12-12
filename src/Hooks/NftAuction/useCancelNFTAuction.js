// useCancelAuction.js
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from '../../components/marketplace'; // Marketplace kontratı

const useCancelNFTAuction = (signer, CONTRACT_ADDRESS) => {
  const cancelAuction = async (nft, index) => {
    const Contract_id = nft.Contract_id;
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer 
    );

    try {
      const tx = await marketplaceContract.cancelNFTAuction(Contract_id);
      await signer.provider.waitForTransaction(tx.hash, 1);
      toast.success("Auction cancelled successfully!");
    } catch (error) {
      console.error("An error occurred while cancelling the auction:", error);
      toast.error("Error cancelling auction.");
    }
  };

  return cancelAuction;
};

export default useCancelNFTAuction;
