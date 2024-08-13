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
       // Hata mesajı kontrolü ve kullanıcıya açıklayıcı toast gösterme
       if (error.message.includes("execution reverted: Cannot cancel auction under these conditions")) {
        toast.error("Auction can't be canceled after a bid. You can only cancel within 5 days after the auction ends.");
      } else {
        toast.error("Error cancelling auction. Please try again.");
      }
    }
  };
  return cancelAuction;
};

export default useCancelNFTAuction;
