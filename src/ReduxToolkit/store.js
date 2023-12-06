// store.js
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import walletMiddleware from './walletMiddleware'; // Middleware'i import et

const middleware = [...getDefaultMiddleware(), walletMiddleware]; // Middleware'i ekle

const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
  middleware,
});

export default store;
