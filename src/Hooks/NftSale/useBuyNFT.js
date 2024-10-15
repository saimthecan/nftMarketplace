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
      signer || provider 
    );

    let toastId;

    try {
      // İlk olarak bir 'loading' toast açıyoruz
      toastId = toast.loading("Waiting for wallet confirmation...");

      const tx = await marketplaceContract.buyNFT(id, { value: price });

      // Kullanıcı cüzdanında onay verdikten sonra işlemi beklemeye alıyoruz
      toast.update(toastId, { render: "Transaction is pending...", type: "info", isLoading: true });
      
      await provider.waitForTransaction(tx.hash, 1);

      // İşlem başarıyla tamamlandığında başarı mesajı gösteriyoruz
      toast.update(toastId, { render: "NFT bought successfully!", type: "success", isLoading: false, autoClose: 5000 });
    } catch (error) {
      console.error("An error occurred while buying the NFT:", error);

      // Eğer işlem cüzdandan reddedilirse ya da başka bir hata oluşursa
      if (error.code === 4001) {
        toast.update(toastId, { render: "Transaction rejected by user.", type: "error", isLoading: false, autoClose: 5000 });
      } else {
        toast.update(toastId, { render: "Error buying NFT. Please try again.", type: "error", isLoading: false, autoClose: 5000 });
      }
    }
  }, [signer, provider, CONTRACT_ADDRESS, balance]);

  return buyNFT;
};

export default useBuyNFT;
