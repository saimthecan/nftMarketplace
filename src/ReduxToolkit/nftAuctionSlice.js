// nftAuctionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../config/apolloClient';
import { GET_NFT_BIDS } from '../queries/nftQueries';

// Asenkron thunk işlevi
export const fetchLatestBids = createAsyncThunk(
  'nftAuction/fetchLatestBids',
  async () => {
    const { data } = await client.query({
      query: GET_NFT_BIDS,
    });
    return data.nftbids.reduce((acc, bid) => {
      const existingBid = acc[bid.Contract_id];
      if (!existingBid || bid.blockTimestamp > existingBid.blockTimestamp) {
        acc[bid.Contract_id] = {
          amount: bid.amount,
          bidder: bid.bidder,
          blockTimestamp: bid.blockTimestamp,
        };
      }
      return acc;
    }, {});
  }
);

const nftAuctionSlice = createSlice({
  name: 'nftAuction',
  initialState: {
    latestBids: {},
    loading: false,
    error: null,
  },
  reducers: {
   
  },
  extraReducers: {
    [fetchLatestBids.pending]: (state) => {
      state.loading = true;
    },
    [fetchLatestBids.fulfilled]: (state, action) => {
      state.latestBids = action.payload;
      state.loading = false;
    },
    [fetchLatestBids.rejected]: (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    },
  },
});

export default nftAuctionSlice.reducer;
