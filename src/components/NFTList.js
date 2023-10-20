// src/components/NFTList.js
import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LISTED_NFTS } from '../queries/nftQueries';
import client from '../config/apolloClient';

const NFTList = () => {
  const { loading, error, data } = useQuery(GET_LISTED_NFTS, { client });

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  if (!data || !data.nFTListedForSales) return 'No data available';
  
  return (
    <div>
      {data.nFTListedForSales.map(nft => (
        <div key={nft.id}>
          <p>Seller: {nft.seller}</p>
          <p>Price: {nft.price}</p>
        </div>
      ))}
    </div>
  );
      }  

export default NFTList;
