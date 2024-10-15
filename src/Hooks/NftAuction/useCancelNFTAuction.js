import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from '../../abi/marketplace'; // Marketplace kontratı

const useCancelNFTAuction = (signer, CONTRACT_ADDRESS) => {
  const cancelAuction = async (nft, index) => {
    const NFTMarketplace_id = nft.NFTMarketplace_id;
    
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer 
    );

    // toastId'yi burada tanımlıyoruz, böylece hem try hem catch bloklarında erişilebilir oluyor
    let toastId;

    try {
      // 'toastId' ile 'toast.loading' fonksiyonunu çağırıyoruz
      toastId = toast.loading("Waiting for wallet confirmation...");
      
      // İşlemi başlatıyoruz
      const tx = await marketplaceContract.cancelNFTAuction(NFTMarketplace_id);
       
      // Cüzdan onayından sonra işlem devam ederken 'pending' mesajı
      toast.update(toastId, { render: "Transaction is pending...", type: "info", isLoading: true });
 
      // İşlemi bekletiyoruz
      await signer.provider.waitForTransaction(tx.hash, 1);
       
      // İşlem başarıyla tamamlanınca 'success' mesajı
      toast.update(toastId, { render: "Auction cancelled successfully!", type: "success", isLoading: false, autoClose: 5000 });
    } catch (error) {
      // İşlem reddedildiyse veya hata varsa
      if (error.code === 4001) { // 'user rejected transaction' hatası kodu
        toast.update(toastId, { render: "Transaction rejected by user.", type: "error", isLoading: false, autoClose: 5000 });
      } else {
        toast.update(toastId, {
          render: error.message.includes("execution reverted: Cannot cancel auction under these conditions")
            ? "Auction can't be canceled after a bid. You can only cancel within 5 days after the auction ends."
            : "Error cancelling auction. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }
  };
  return cancelAuction;
};

export default useCancelNFTAuction;
