import { createSlice } from '@reduxjs/toolkit';

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    account: null,
    balance: null,
  },
  reducers: {
    connectWallet: (state, action) => {
      state.account = action.payload;
    },
    setBalance: (state, action) => { 
      state.balance = action.payload;
    },
  },
});

export const { connectWallet, setBalance } = walletSlice.actions;

export default walletSlice.reducer;
