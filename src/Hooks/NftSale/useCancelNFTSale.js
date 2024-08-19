import { useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from "../../abi/marketplace";

const useCancelNFTSale = (signer, provider, CONTRACT_ADDRESS) => {
  const cancelNFTSale = useCallback(async (id) => {
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );

    try {
      const tx = await marketplaceContract.cancelNFTSale(id);
      await provider.waitForTransaction(tx.hash, 1);
      toast.success("NFT sale cancelled successfully!");
    } catch (error) {
      console.error("An error occurred while cancelling the NFT sale:", error);
    }
  }, [signer, provider, CONTRACT_ADDRESS]);

  return cancelNFTSale;
};

export default useCancelNFTSale;
