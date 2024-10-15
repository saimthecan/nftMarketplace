import { useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from "../../abi/marketplace";

const useCancelNFTSale = (signer, provider, CONTRACT_ADDRESS) => {
  const cancelNFTSale = useCallback(async (id) => {
    if (!signer && !provider) {
      console.error("Hem signer hem de provider mevcut değil.");
      return;
    }

    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer || provider // Signer varsa onu kullan, yoksa provider kullan
    );

    let toastId;

    try {
      // İlk olarak bir 'loading' toast açıyoruz
      toastId = toast.loading("Waiting for wallet confirmation...");

      const tx = await marketplaceContract.cancelNFTSale(id);

      // Kullanıcı cüzdanında onay verdikten sonra işlemi beklemeye alıyoruz
      toast.update(toastId, { render: "Transaction is pending...", type: "info", isLoading: true });
      
      await provider.waitForTransaction(tx.hash, 1);

      // İşlem başarıyla tamamlandığında başarı mesajı gösteriyoruz
      toast.update(toastId, { render: "NFT sale cancelled successfully!", type: "success", isLoading: false, autoClose: 5000 });
    } catch (error) {
      console.error("An error occurred while cancelling the NFT sale:", error);

      // Eğer işlem cüzdandan reddedilirse ya da başka bir hata oluşursa
      if (error.code === 4001) {
        toast.update(toastId, { render: "Transaction rejected by user.", type: "error", isLoading: false, autoClose: 5000 });
      } else {
        toast.update(toastId, { render: "Error cancelling sale. Please try again.", type: "error", isLoading: false, autoClose: 5000 });
      }
    }
  }, [signer, provider, CONTRACT_ADDRESS]);

  return cancelNFTSale;
};

export default useCancelNFTSale;
