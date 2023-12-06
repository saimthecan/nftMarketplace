// walletMiddleware.js
import { setBalance } from './walletSlice';
import { Web3Provider } from "@ethersproject/providers";

const walletMiddleware = (store) => (next) => async (action) => {
  if (action.type === 'wallet/connectWallet') {
    const provider = new Web3Provider(window.ethereum);
    try {
      const balanceInWei = await provider.getBalance(action.payload);

      // Balance'i BigInt olarak dönüştür ve string'e çevir
      // eslint-disable-next-line no-undef
      const bigNumberValue = BigInt(balanceInWei._hex);
      const decimalValue = bigNumberValue.toString();

      // Redux state'ini güncelle
      store.dispatch(setBalance(decimalValue));
    } catch (error) {
      console.error("Error while fetching wallet balance:", error);
    }
  }
  return next(action);
};

export default walletMiddleware;
