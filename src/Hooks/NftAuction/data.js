import { useState, useEffect } from 'react';
import useQueries from "../useQueries";
import useWeb3Provider from '../useWeb3Provider'; 
import { ERC721 } from '../../abi/erc721abi'; 
import { ethers } from 'ethers';

const useNFTAuctionData = () => {
  const [nftImages, setNftImages] = useState({});
  const [unsoldNFTs, setUnsoldNFTs] = useState([]);
  const [nftDetails, setNftDetails] = useState({});
  const [totalNFTs, setTotalNFTs] = useState(0); 

  const { provider } = useWeb3Provider();

  //queries
  const { 
    loadingListedAuction, errorListedAuction, dataListedAuction,
    loadingSoldAuction, errorSoldAuction, dataSoldAuction,
    loadingCancelledAuction, errorCancelledAuction, dataCancelledAuction,
  } = useQueries();

  useEffect(() => {
    if (dataListedAuction && dataListedAuction.nftlistedForAuctions) {
      const fetchMetadata = async () => {
        for (const nft of dataListedAuction.nftlistedForAuctions) {
          const contract = new ethers.Contract(nft.contractAddress, ERC721, provider);
          try {
            const tokenUri = await contract.tokenURI(nft.tokenId);
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
  }, [dataListedAuction, provider]);

  //Filters unsold and uncanceled NFTs and creates the current list.
  useEffect(() => {
    if (
      dataListedAuction &&
      dataListedAuction.nftlistedForAuctions &&
      dataSoldAuction &&
      dataSoldAuction.nftauctionFinisheds &&
      dataCancelledAuction &&
      dataCancelledAuction.nftauctionCancelleds
    ) {
      const soldIds = dataSoldAuction.nftauctionFinisheds.map(
        (nft) => nft.NFTMarketplace_id
      );
      const cancelledIds = dataCancelledAuction.nftauctionCancelleds.map(
        (nft) => nft.NFTMarketplace_id
      );
      const unsold = dataListedAuction.nftlistedForAuctions.filter(
        (nft) =>
          !soldIds.includes(nft.NFTMarketplace_id) &&
          !cancelledIds.includes(nft.NFTMarketplace_id)
      );
      setUnsoldNFTs(unsold);
    }
  }, [dataListedAuction, dataSoldAuction, dataCancelledAuction]);

  return { nftImages, nftDetails, unsoldNFTs, loadingListedAuction, errorListedAuction, loadingSoldAuction, errorSoldAuction, loadingCancelledAuction, errorCancelledAuction };
};

export default useNFTAuctionData;
