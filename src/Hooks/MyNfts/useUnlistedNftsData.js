import { useState, useEffect } from 'react';
import useQueries from "../useQueries";
import useWeb3Provider from '../useWeb3Provider';
import { ERC721 } from '../../abi/erc721abi';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';

const useUnlistedNftsData = () => {
  const [nftData, setNftData] = useState([]);
  const account = useSelector(state => state.wallet.account);

  const { provider } = useWeb3Provider();
  const {
    dataListedSale,
    dataSold,
    dataCancelledSales,
    loadingListedSale,
    errorListedSale
  } = useQueries();

  useEffect(() => {
    const fetchMetadata = async (contractAddress, tokenId) => {
      const contract = new ethers.Contract(contractAddress, ERC721, provider);
      try {
        const tokenUri = await contract.tokenURI(tokenId);
        const response = await fetch(tokenUri);
        const metadata = await response.json();
        return metadata;
      } catch (error) {
        console.error(`Error fetching metadata for token ID ${tokenId}:`, error);
        return null;
      } 
    };

    const fetchAllData = async () => {
      if (dataListedSale && dataListedSale.nftlistedForSales) {
        const soldIds = dataSold?.nftsolds?.map((nft) => nft.NFTMarketplace_id) || [];
        const cancelledSaleIds = dataCancelledSales?.nftsaleCancelleds?.map((nft) => nft.NFTMarketplace_id) || [];
       
        const unsoldNfts = dataListedSale.nftlistedForSales.filter(
          (nft) =>
            !soldIds.includes(nft.NFTMarketplace_id) &&
            !cancelledSaleIds.includes(nft.NFTMarketplace_id) &&
            nft.seller.toLowerCase() === account?.toLowerCase()
           
          
        );

      

        const nftsWithMetadata = await Promise.all(unsoldNfts.map(async nft => {
          const metadata = await fetchMetadata(nft.contractAddress, nft.tokenId);
          return { ...nft, metadata };
        }));

        
        setNftData(nftsWithMetadata);
      }
    };

    fetchAllData();
  }, [dataListedSale, dataSold, dataCancelledSales, account, provider, loadingListedSale, errorListedSale]);
  
  return { nftData };
};

export default useUnlistedNftsData;
