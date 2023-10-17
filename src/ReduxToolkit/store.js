import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';

const middleware = [...getDefaultMiddleware(), /* ekstra middleware'lar buraya */];

const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
  middleware,
});

export default store;
