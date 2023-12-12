import { useState, useEffect } from 'react';
import useQueries from "../useQueries";
import useWeb3Provider from '../useWeb3Provider'; 
import { ERC721 } from '../../components/erc721abi'; 
import { ethers } from 'ethers';

const useNFTListData = () => {
  const [nftImages, setNftImages] = useState({});
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);

  const { provider } = useWeb3Provider();

  const { loadingListedSale, errorListedSale, dataListedSale, loadingSold, errorSold, dataSold, dataCancelledSales } = useQueries();

  useEffect(() => {
    if (dataListedSale && dataListedSale.nftlistedForSales) {
      const fetchMetadata = async () => {
        for (const nft of dataListedSale.nftlistedForSales) {
          const contract = new ethers.Contract(nft.contractAddress, ERC721, provider);
          try {
            const tokenUri = await contract.tokenURI(nft.tokenId);
            const response = await fetch(tokenUri);
            const metadata = await response.json();
            setNftImages(prev => ({ ...prev, [nft.tokenId]: metadata.image }));
          } catch (error) {
            console.error(`Error fetching metadata for token ID ${nft.tokenId}:`, error);
          }
        }
      };

      fetchMetadata();
    }
  }, [dataListedSale, provider]);

  useEffect(() => {
    if (
      dataListedSale &&
      dataListedSale.nftlistedForSales &&
      dataSold &&
      dataSold.nftsolds &&
      dataCancelledSales &&
      dataCancelledSales.nftsaleCancelleds
    ) {
      const soldIds = dataSold.nftsolds.map((nft) => nft.Contract_id);
      const cancelledSaleIds = dataCancelledSales.nftsaleCancelleds.map(
        (nft) => nft.Contract_id
      );
      const unsold = dataListedSale.nftlistedForSales.filter(
        (nft) =>
          !soldIds.includes(nft.Contract_id) &&
          !cancelledSaleIds.includes(nft.Contract_id)
      );
      setUnsoldNFTs(unsold);
    }
  }, [dataListedSale, dataSold, dataCancelledSales]);

  return { nftImages, unsoldNFTs, loadingListedSale, errorListedSale, loadingSold, errorSold };
};

export default useNFTListData;