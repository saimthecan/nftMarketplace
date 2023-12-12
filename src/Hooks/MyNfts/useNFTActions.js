// useNFTActions.js
import { ethers } from 'ethers';
import { marketplace } from '../../components/marketplace';
import { toast } from 'react-toastify';
import { parseEther } from 'ethers/utils';

const NFTType = {
  ERC721: 0,
  ERC1155: 1,
};

const useNFTActions = (signer, provider, CONTRACT_ADDRESS) => {
  const startNFTSale = async (nft, price) => {
    try {
      const priceInWei = parseEther(price.toString());
      const nftType = nft.tokenType === "ERC721" ? NFTType.ERC721 : NFTType.ERC1155;
      const quantity = nft.quantity || 1; // Miktar değeri, varsayılan olarak 1

      const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, marketplace, signer);
      const tx = await marketplaceContract.startNFTSale(
        nftType,
        nft.contract.address,
        priceInWei,
        nft.tokenId,
        quantity
      );
      await provider.waitForTransaction(tx.hash, 1);
      toast.success("NFT sale started successfully");
    } catch (error) {
      toast.error("Error starting NFT sale");
      console.error("Error starting NFT sale:", error);
    }
  };

  return { startNFTSale };
};

export default useNFTActions;
