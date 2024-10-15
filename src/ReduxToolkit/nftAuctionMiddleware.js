// nftAuctionMiddleware.js


const nftAuctionMiddleware = (store) => (next) => (action) => {
  if (action.type === 'nftAuction/fetchLatestBids/fulfilled') {
  }
  return next(action);
};

export default nftAuctionMiddleware;
