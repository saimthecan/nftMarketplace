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