// store.js
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import nftAuctionReducer from './nftAuctionSlice';
import nftAuctionMiddleware from './nftAuctionMiddleware';
import walletMiddleware from './walletMiddleware';
import networkReducer  from './networkSlice.js';

const store = configureStore({
  reducer: {
    wallet: walletReducer,
    nftAuction: nftAuctionReducer,
    network: networkReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(walletMiddleware, nftAuctionMiddleware),
});

export default store;
