// usePlaceBid.js
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from '../../components/marketplace'; // Marketplace kontratı
import { parseEther } from "ethers/utils";

const usePlaceBid = (signer, CONTRACT_ADDRESS, balance, latestBids) => {
  const placeBid = async (nft, enteredPrice) => {
    const priceInEth = enteredPrice;

    if (!priceInEth || isNaN(parseFloat(priceInEth))) {
      toast.error("Please enter a valid number");
      return false;
    }

    const priceInWei = parseEther(priceInEth.toString());
    const startingPriceInWei = nft.startingPrice;

     // Check if the entered bid is lower than the starting price
     if (priceInWei <= startingPriceInWei) {
        toast.error("Your bid cannot be lower than the starting price.");
        return;
      }

    const Contract_id = nft.Contract_id;
    const currentHighestBid = latestBids[Contract_id] ? latestBids[Contract_id].amount : 0;

    if (!balance || parseFloat(balance) <= parseFloat(priceInWei)) {
      toast.error("Insufficient Balance");
      return false;
    }

    if (priceInWei <= currentHighestBid) {
      toast.error("Your bid must be higher than the current highest bid.");
      return false;
    }

    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      marketplace,
      signer
    );

    try {
      const tx = await marketplaceContract.bid(Contract_id, { value: priceInWei });
      await signer.provider.waitForTransaction(tx.hash, 1);
      toast.success("Bid placed successfully!");
      return true;
    } catch (error) {
      if (error.message.includes("user rejected transaction")) {
        toast.error("Transaction rejected.");
      } else {
        toast.error("Error placing bid.");
      }
      return false;
    }
  };

  return placeBid;
};

export default usePlaceBid;
