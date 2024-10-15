import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from '../../abi/marketplace'; // Marketplace kontratı
import { parseEther } from "ethers/utils";

const usePlaceBid = (signer, CONTRACT_ADDRESS, balance, latestBids) => {
  const placeBid = async (nft, priceInEth) => {
    if (!priceInEth || isNaN(parseFloat(priceInEth))) {
      toast.error("Please enter a valid number.");
      return;
    }

    const priceInWei = parseEther(priceInEth.toString());
    if (priceInWei <= nft.startingPrice) {
      toast.error("Your bid cannot be lower than the starting price.");
      return;
    }

    if (!balance || parseFloat(balance) < parseFloat(priceInWei)) {
      toast.error("Insufficient Balance");
      return;
    }

    const currentHighestBid = latestBids[nft.NFTMarketplace_id]?.amount || 0;
    if (priceInWei <= currentHighestBid) {
      toast.error("Your bid must be higher than the current highest bid.");
      return;
    }

    const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, marketplace, signer);
    
    let toastId;

    try {
      // İlk olarak bir 'loading' toast açıyoruz
      toastId = toast.loading("Waiting for wallet confirmation...");

      const tx = await marketplaceContract.bid(nft.NFTMarketplace_id, { value: priceInWei });

      // Cüzdan onayından sonra işlem beklenirken
      toast.update(toastId, { render: "Transaction is pending...", type: "info", isLoading: true });

      await signer.provider.waitForTransaction(tx.hash, 1);

      // İşlem başarıyla tamamlandığında başarı mesajı gösteriyoruz
      toast.update(toastId, { render: "Bid placed successfully!", type: "success", isLoading: false, autoClose: 5000 });
    } catch (error) {
      if (error.message.includes("user rejected transaction")) {
        toast.update(toastId, { render: "Transaction rejected.", type: "error", isLoading: false, autoClose: 5000 });
      } else {
        toast.update(toastId, { render: "Error placing bid.", type: "error", isLoading: false, autoClose: 5000 });
      }
    }
  };

  return placeBid;
};

export default usePlaceBid;
