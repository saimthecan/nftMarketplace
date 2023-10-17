import { createSlice } from '@reduxjs/toolkit';

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    account: null,
  },
  reducers: {
    connectWallet: (state, action) => {
      state.account = action.payload;
    },
  },
});

export const { connectWallet } = walletSlice.actions;

export default walletSlice.reducer;
