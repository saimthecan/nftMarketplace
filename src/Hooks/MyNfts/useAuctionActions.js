import { ethers } from 'ethers';
import { marketplace } from '../../components/marketplace';
import { toast } from 'react-toastify';
import { parseEther } from 'ethers/utils';

const NFTType = {
  ERC721: 0,
  ERC1155: 1,
};

const useAuctionActions = (signer, provider, CONTRACT_ADDRESS) => {
  const startNFTAuction = async (nft, price, startTimestamp, endTimestamp) => {
    try {
      const priceInWei = parseEther(price.toString());
      const nftType = nft.tokenType === "ERC721" ? NFTType.ERC721 : NFTType.ERC1155;
      const quantity = nft.quantity || 1;

      const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, marketplace, signer);
      const tx = await marketplaceContract.startNFTAuction(
        nftType,
        nft.contract.address,
        priceInWei,
        nft.tokenId,
        quantity,
        startTimestamp,
        endTimestamp
      );
      await provider.waitForTransaction(tx.hash, 1);
      toast.success("NFT auction started successfully");
    } catch (error) {
      if (error.code === 4001) { // MetaMask Tx Signature: User denied transaction signature
        toast.error("Transaction was rejected by the user");
      } else {
        toast.error("Error starting NFT auction");
      }
      console.error("Error starting NFT auction:", error);
      throw error; // Hatanın yukarıya fırlatılmasını sağla
    }
  };

  return { startNFTAuction };
};

export default useAuctionActions;
