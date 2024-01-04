// nftAuctionMiddleware.js


const nftAuctionMiddleware = (store) => (next) => (action) => {
  if (action.type === 'nftAuction/fetchLatestBids/fulfilled') {
    // Özel işlemler
    console.log('Latest bids updated:', action.payload);
  }
  return next(action);
};

export default nftAuctionMiddleware;
