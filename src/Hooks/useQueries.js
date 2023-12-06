// useListedNftsForAuction.js
import { useQuery } from '@apollo/client';
import { GET_LISTED_NFTS_FOR_AUCTION,
         GET_FINISHED_NFT_AUCTIONS,
         GET_CANCELLED_NFT_AUCTIONS,
         GET_NFT_BIDS,
         GET_LISTED_NFTS,
         GET_SOLD_NFTS,
         GET_CANCELLED_NFT_SALES
          } from '../queries/nftQueries';
import client from "../config/apolloClient";

const useQueries = () => {

  //auction
  const { 
    loading: loadingListedAuction, 
    error: errorListedAuction, 
    data: dataListedAuction 
  } = useQuery(GET_LISTED_NFTS_FOR_AUCTION, {client, pollInterval: 5000 });

  const {
    loading: loadingSoldAuction,
    error: errorSoldAuction,
    data: dataSoldAuction,
  } = useQuery(GET_FINISHED_NFT_AUCTIONS, { client, pollInterval: 5000 });

  const {
    loading: loadingCancelledAuction,
    error: errorCancelledAuction,
    data: dataCancelledAuction,
  } = useQuery(GET_CANCELLED_NFT_AUCTIONS, { client, pollInterval: 5000 });

  const {
    loading: loadingNftBids,
    error: errorNftBids,
    data: dataNftBids,
  } = useQuery(GET_NFT_BIDS, {client, pollInterval: 5000 });

  //sale
  const {
    loading: loadingListedSale,
    error: errorListedSale,
    data: dataListedSale,
  } = useQuery(GET_LISTED_NFTS, { client, pollInterval: 5000 });

  const {
    loading: loadingSold,
    error: errorSold,
    data: dataSold,
  } = useQuery(GET_SOLD_NFTS, { client, pollInterval: 5000 });

  const {
    data: dataCancelledSales,
    loading: loadingCancelledSales,
    error: errorCancelledSales
  } = useQuery(GET_CANCELLED_NFT_SALES, { client, pollInterval: 5000 });



  return { 
    loadingListedAuction, errorListedAuction, dataListedAuction ,
    loadingSoldAuction, errorSoldAuction,dataSoldAuction,
    loadingCancelledAuction, errorCancelledAuction, dataCancelledAuction,
    loadingNftBids, errorNftBids, dataNftBids,
    loadingListedSale, errorListedSale, dataListedSale,
    loadingSold, errorSold, dataSold,
    dataCancelledSales, loadingCancelledSales, errorCancelledSales
  
  };
};

export default useQueries;
