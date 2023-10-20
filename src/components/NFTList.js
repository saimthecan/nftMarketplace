// src/components/NFTList.js
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_LISTED_NFTS } from '../queries/nftQueries';
import client from '../config/apolloClient';
import { Box, Text } from '@chakra-ui/react';

const NFTList = () => {
  const { loading, error, data } = useQuery(GET_LISTED_NFTS, { client });

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  if (!data || !data.nftlistedForSales) return 'No data available';

  return (
    <div>
      {data.nftlistedForSales.map(nft => (
        <Box border="1px" borderRadius="md" padding="5" margin="5" key={nft.id}>
          <Text><strong>Contract ID:</strong> {nft.Contract_id}</Text>
          <Text><strong>ID:</strong> {nft.id}</Text>
          <Text><strong>Seller:</strong> {nft.seller}</Text>
          <Text><strong>Price:</strong> {nft.price}</Text>
        </Box>
      ))}
    </div>
  );
};

export default NFTList;
