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

    let toastId;

    try {
      // İlk olarak bir 'loading' toast açıyoruz
      toastId = toast.loading("Waiting for wallet confirmation...");

      const tx = await marketplaceContract.finishNFTAuction(nft.NFTMarketplace_id);

      // Cüzdan onayından sonra işlem beklenirken
      toast.update(toastId, { render: "Transaction is pending...", type: "info", isLoading: true });

      await signer.provider.waitForTransaction(tx.hash, 1);

      // İşlem başarıyla tamamlandığında başarı mesajı gösteriyoruz
      toast.update(toastId, { render: "Auction finished successfully!", type: "success", isLoading: false, autoClose: 5000 });
    } catch (error) {
      console.error("An error occurred while finishing the auction:", error);

      // Eğer işlem cüzdandan reddedilirse veya hata oluşursa
      if (error.code === 4001) {
        toast.update(toastId, { render: "Transaction rejected by user.", type: "error", isLoading: false, autoClose: 5000 });
      } else {
        toast.update(toastId, { render: "Error finishing auction.", type: "error", isLoading: false, autoClose: 5000 });
      }
    }
  };

  return claimNFT;
};

export default useClaimNFTAuction;
