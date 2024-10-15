import { useState, useEffect } from 'react';
import useQueries from "../useQueries";
import useWeb3Provider from '../useWeb3Provider';
import { ERC721 } from '../../abi/erc721abi';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';

const useOnAuctionData = () => {
  const [nftDataAuction, setNftData] = useState([]);
  const account = useSelector(state => state.wallet.account);

  const { provider } = useWeb3Provider();
  const {
    dataListedAuction,
    dataSoldAuction,
    dataCancelledAuction,
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
        return null;
      }
    };

    const fetchAllData = async () => {
      if (dataListedAuction && dataListedAuction.nftlistedForAuctions) {
        const soldIds = dataSoldAuction?.nftauctionFinisheds?.map((nft) => nft.NFTMarketplace_id) || [];
        const cancelledSaleIds = dataCancelledAuction?.nftauctionCancelleds?.map((nft) => nft.NFTMarketplace_id) || [];

        const unsoldNfts = dataListedAuction.nftlistedForAuctions.filter(
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
  }, [dataListedAuction, dataSoldAuction, dataCancelledAuction, account, provider]);

  return { nftDataAuction };
};

export default useOnAuctionData;
