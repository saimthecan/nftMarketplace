import { useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from "../../abi/marketplace";

const useBuyNFT = (signer, provider, CONTRACT_ADDRESS, balance) => {
  const buyNFT = useCallback(async (id, price) => {
    if (!balance || parseFloat(balance) <= parseFloat(price)) {
      toast.error("Insufficient Balance");
      return;
    }

    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );

    try {
      const tx = await marketplaceContract.buyNFT(id, { value: price });
      await provider.waitForTransaction(tx.hash, 1);
      toast.success("NFT bought successfully!");
    } catch (error) {
      console.error("An error occurred while buying the NFT:", error);
    }
  }, [signer, provider, CONTRACT_ADDRESS, balance]);

  return buyNFT;
};

export default useBuyNFT;
