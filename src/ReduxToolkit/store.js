// store.js
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import nftAuctionReducer from './nftAuctionSlice';
import nftAuctionMiddleware from './nftAuctionMiddleware';
import walletMiddleware from './walletMiddleware';

const store = configureStore({
  reducer: {
    wallet: walletReducer,
    nftAuction: nftAuctionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(walletMiddleware, nftAuctionMiddleware),
});

export default store;
