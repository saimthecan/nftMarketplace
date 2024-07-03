// usePlaceBid.js
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { marketplace } from '../../components/marketplace'; // Marketplace kontratı
import { parseEther } from "ethers/utils";

const usePlaceBid = (signer, CONTRACT_ADDRESS, enteredPrices, balance, latestBids) => {
    const placeBid = async (nft) => {
      const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
      const priceInEth = enteredPrices[uniqueKey];
  
      if (!priceInEth || isNaN(parseFloat(priceInEth))) {
        toast.error("Please enter a valid number");
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
  
      const currentHighestBid = latestBids[nft.Contract_id]?.amount || 0;
      if (priceInWei <= currentHighestBid) {
        toast.error("Your bid must be higher than the current highest bid.");
        return;
      }
  
      const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, marketplace, signer);
      try {
        const tx = await marketplaceContract.bid(nft.Contract_id, { value: priceInWei });
        await signer.provider.waitForTransaction(tx.hash, 1);
        toast.success("Bid placed successfully!");
      } catch (error) {
        if (error.message.includes("user rejected transaction")) {
          toast.error("Transaction rejected.");
        } else {
          toast.error("Error placing bid.");
        }
      }
    };
  
    return placeBid;
  };
  
  export default usePlaceBid;
