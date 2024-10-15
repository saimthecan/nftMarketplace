import { useState, useEffect } from 'react';
import useQueries from "../useQueries";
import useWeb3Provider from '../useWeb3Provider'; 
import { ERC721 } from '../../abi/erc721abi'; 
import { ERC1155 } from '../../abi/erc1155abi';
import { ethers } from 'ethers';

const useNFTListData = () => {
  const [nftImages, setNftImages] = useState({});
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);
  const [nftDetails, setNftDetails] = useState({});

  const { provider } = useWeb3Provider();

  const { loadingListedSale, errorListedSale, dataListedSale, loadingSold, errorSold, dataSold, dataCancelledSales } = useQueries();

  useEffect(() => {
    if (dataListedSale && dataListedSale.nftlistedForSales) {
      const fetchMetadata = async () => {
        for (const nft of dataListedSale.nftlistedForSales) {
          const tokenType = nft.tokenType || "ERC721"; // Default to ERC721 if tokenType is undefined         
          const contract = new ethers.Contract(nft.contractAddress, tokenType === "ERC721" ? ERC721 : ERC1155, provider);
          try {
            let tokenUri;
            if (tokenType === "ERC721") {
              tokenUri = await contract.tokenURI(nft.tokenId);
            } else {
              tokenUri = await contract.uri(nft.tokenId);
              tokenUri = tokenUri.replace('{id}', nft.tokenId);
            }
            const response = await fetch(tokenUri);
            const metadata = await response.json();
            const uniqueKey = `${nft.contractAddress}_${nft.tokenId}`;
            setNftImages(prev => ({ ...prev, [uniqueKey]: metadata.image }));
            setNftDetails(prev => ({
              ...prev,
              [uniqueKey]: {
                name: metadata.name,
                description: metadata.description,
                createdBy: metadata.created_by, // Assuming 'created_by' is the correct field in your metadata
              },
            }));
           
            
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
      const soldIds = dataSold.nftsolds.map((nft) => nft.NFTMarketplace_id);
      const cancelledSaleIds = dataCancelledSales.nftsaleCancelleds.map(
        (nft) => nft.NFTMarketplace_id
      );
      const unsold = dataListedSale.nftlistedForSales.filter(
        (nft) =>
          !soldIds.includes(nft.NFTMarketplace_id) &&
          !cancelledSaleIds.includes(nft.NFTMarketplace_id)
      );
      setUnsoldNFTs(unsold);
    }
  }, [dataListedSale, dataSold, dataCancelledSales]);

  return { nftImages, nftDetails, unsoldNFTs, loadingListedSale, errorListedSale, loadingSold, errorSold };
};

export default useNFTListData;
