// src/queries/nftQueries.js
import gql from 'graphql-tag';

export const GET_LISTED_NFTS = gql`
  query {
    nftlistedForSales {
      contractAddress
      id
      NFTMarketplace_id
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
      NFTMarketplace_id
    }
  }
`;

export const GET_CANCELLED_NFT_SALES = gql`
  query {
    nftsaleCancelleds {
      NFTMarketplace_id
    }
  }
`;

export const GET_LISTED_NFTS_FOR_AUCTION = gql`
  query GetListedNftsForAuction {
    nftlistedForAuctions {
      startingPrice
      NFTMarketplace_id
      auctionStartTime
      auctionEndTime
      contractAddress
      seller
      tokenId
      startingPrice
    }
  }
`;

export const GET_FINISHED_NFT_AUCTIONS = gql`
  query GetFinishedNftAuctions {
    nftauctionFinisheds {
      buyer
      contractAddress
      tokenId
      NFTMarketplace_id
    }
  }
`;

export const GET_CANCELLED_NFT_AUCTIONS = gql`
  query {
    nftauctionCancelleds {
       NFTMarketplace_id
    }
  }
`;

export const GET_NFT_BIDS = gql`
  query {
    nftbids {
       NFTMarketplace_id
       amount
       bidder
       blockTimestamp
    }
  }
`;
