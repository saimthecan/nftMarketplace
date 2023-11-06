// src/queries/nftQueries.js
import gql from 'graphql-tag';

export const GET_LISTED_NFTS = gql`
  query {
    nftlistedForSales {
      contractAddress
      id
      Contract_id
      seller
      price
      tokenId
      
    }
  }
`;

export const GET_SOLD_NFTS = gql`
  query {
    nftsolds {
      buyer
      contractAddress
      tokenId
      Contract_id
    }
  }
`;

export const GET_LISTED_NFTS_FOR_AUCTION = gql`
  query GetListedNftsForAuction {
    nftlistedForAuctions {
      tokenId
      startingPrice
      seller
      contractAddress
      Contract_id
    }
  }
`;

export const GET_FINISHED_NFT_AUCTIONS = gql`
  query GetFinishedNftAuctions {
    nftauctionFinisheds {
      buyer
      contractAddress
      tokenId
      Contract_id
    }
  }
`;
