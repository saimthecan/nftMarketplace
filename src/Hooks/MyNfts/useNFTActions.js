import { ethers } from 'ethers';
import { marketplace } from '../../abi/marketplace';
import { toast } from 'react-toastify';
import { parseEther } from 'ethers/utils';

const NFTType = {
  ERC721: 0,
  ERC1155: 1,
};

const useNFTActions = (signer, provider, CONTRACT_ADDRESS) => {
  const startNFTSale = async (nft, price, quantity) => {
    let toastId;
    
    try {
      const priceInWei = parseEther(price.toString());
      const nftType = nft.tokenType === "ERC721" ? NFTType.ERC721 : NFTType.ERC1155;

      const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, marketplace, signer);

      // İlk olarak bir 'loading' toast açıyoruz
      toastId = toast.loading("Waiting for wallet confirmation...");

      const tx = await marketplaceContract.startNFTSale(
        nftType,
        nft.contract.address,
        priceInWei,
        nft.tokenId,
        quantity
      );

      // Cüzdan onayından sonra işlem beklenirken
      toast.update(toastId, { render: "Transaction is pending...", type: "info", isLoading: true });

      await provider.waitForTransaction(tx.hash, 1);

      // İşlem başarıyla tamamlandığında başarı mesajı gösteriyoruz
      toast.update(toastId, { render: "NFT sale started successfully!", type: "success", isLoading: false, autoClose: 5000 });
    } catch (error) {
      if (error.code === 4001) {
        toast.update(toastId, { render: "Transaction was rejected by the user", type: "error", isLoading: false, autoClose: 5000 });
      } else {
        toast.update(toastId, { render: "Error starting NFT sale", type: "error", isLoading: false, autoClose: 5000 });
      }
      throw error;
    }
  };

  return { startNFTSale };
};

export default useNFTActions;
