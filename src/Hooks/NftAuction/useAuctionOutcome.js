import { useSelector } from 'react-redux';

const useAuctionOutcome = () => {
  const { latestBids } = useSelector((state) => state.nftAuction);
  const account = useSelector((state) => state.wallet.account);

  const isUserHighestBidder = (nft) => {
    return (
      latestBids[nft.NFTMarketplace_id] &&
      account &&
      latestBids[nft.NFTMarketplace_id]?.bidder.toLowerCase() === account.toLowerCase()
    );
  };

  const isAuctionEnded = (nft) => {
    return new Date().getTime() >= nft.auctionEndTime * 1000;
  };

  const isAuctionStarted = (nft) => {
    return new Date().getTime() >= nft.auctionStartTime * 1000;
  };

  const isAuctionEndedAndUserIsHighestBidder = (nft) => {
    return isAuctionEnded(nft) && isUserHighestBidder(nft);
  };

  return { isAuctionEnded, isUserHighestBidder, isAuctionEndedAndUserIsHighestBidder, isAuctionStarted };
};

export default useAuctionOutcome;
