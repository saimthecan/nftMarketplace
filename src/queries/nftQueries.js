// src/queries/nftQueries.js
import gql from 'graphql-tag';

export const GET_LISTED_NFTS = gql`
  query {
    nftlistedForSales {
      Contract_id
      id
      seller
      price
    }
  }
`;
