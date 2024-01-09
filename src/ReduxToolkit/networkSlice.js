// networkSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const networkSlice = createSlice({
  name: 'network',
  initialState: {
    isWrongNetwork: false,
  },
  reducers: {
    setNetworkStatus: (state, action) => {
      state.isWrongNetwork = action.payload;
    },
  },
});

export const { setNetworkStatus } = networkSlice.actions;

export default networkSlice.reducer;
