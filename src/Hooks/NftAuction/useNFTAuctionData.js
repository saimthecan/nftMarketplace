import { useState, useEffect } from 'react';
import useQueries from "../useQueries";
import useWeb3Provider from '../useWeb3Provider'; 
import { ERC721 } from '../../components/erc721abi'; 
import { ethers } from 'ethers';

const useNFTAuctionData = () => {
    const [nftImages, setNftImages] = useState({});
    const [unsoldNFTs, setUnsoldNFTs] = useState([]);
  
    const { provider } = useWeb3Provider();
  
  //queries
  const { 
    loadingListedAuction, errorListedAuction, dataListedAuction,
    loadingSoldAuction, errorSoldAuction,dataSoldAuction,
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
              setNftImages(prev => ({ ...prev, [nft.tokenId]: metadata.image }));
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
            (nft) => nft.Contract_id
          );
          const cancelledIds = dataCancelledAuction.nftauctionCancelleds.map(
            (nft) => nft.Contract_id
          );
          const unsold = dataListedAuction.nftlistedForAuctions.filter(
            (nft) =>
              !soldIds.includes(nft.Contract_id) &&
              !cancelledIds.includes(nft.Contract_id)
          );
          setUnsoldNFTs(unsold);
        }
      }, [dataListedAuction, dataSoldAuction, dataCancelledAuction]);
  
    return { nftImages, unsoldNFTs, loadingListedAuction, errorListedAuction, loadingSoldAuction, errorSoldAuction, loadingCancelledAuction,errorCancelledAuction };
  };
  
  export default useNFTAuctionData;