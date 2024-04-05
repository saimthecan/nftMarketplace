// store.js
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import nftAuctionReducer from './nftAuctionSlice';
import nftAuctionMiddleware from './nftAuctionMiddleware';
import walletMiddleware from './walletMiddleware';
import networkReducer  from './networkSlice.js';

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = sessionStorage.getItem('appState');
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem('appState', serializedState);
  } catch (err) {
    // Hataları burada ele alın
  }
};

const preloadedState = loadStateFromLocalStorage();

// Mevcut store tanımınıza devam edin
const store = configureStore({
  reducer: {
    wallet: walletReducer,
    nftAuction: nftAuctionReducer,
    network: networkReducer,
    // Diğer reducer'larınız burada
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(walletMiddleware, nftAuctionMiddleware),
  preloadedState, // Yerel depolamadan yüklenen state'i başlangıç state'i olarak kullanın
});

store.subscribe(() => {
  saveStateToLocalStorage({
    wallet: store.getState().wallet,
    // Sadece kaydetmek istediğiniz state'leri burada belirtin
  });
});


export default store;
