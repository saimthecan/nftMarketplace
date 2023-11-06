import {
  Initialized as InitializedEvent,
  NFTAuctionCancelled as NFTAuctionCancelledEvent,
  NFTAuctionFinished as NFTAuctionFinishedEvent,
  NFTBid as NFTBidEvent,
  NFTListedForAuction as NFTListedForAuctionEvent,
  NFTListedForSale as NFTListedForSaleEvent,
  NFTSold as NFTSoldEvent
} from "../generated/Contract/Contract"
import {
  Initialized,
  NFTAuctionCancelled,
  NFTAuctionFinished,
  NFTBid,
  NFTListedForAuction,
  NFTListedForSale,
  NFTSold
} from "../generated/schema"

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTAuctionCancelled(
  event: NFTAuctionCancelledEvent
): void {
  let entity = new NFTAuctionCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Contract_id = event.params.id
  entity.seller = event.params.seller
  entity.contractAddress = event.params.contractAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTAuctionFinished(event: NFTAuctionFinishedEvent): void {
  let entity = new NFTAuctionFinished(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Contract_id = event.params.id
  entity.buyer = event.params.buyer
  entity.contractAddress = event.params.contractAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTBid(event: NFTBidEvent): void {
  let entity = new NFTBid(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Contract_id = event.params.id
  entity.bidder = event.params.bidder
  entity.amount = event.params.amount
  entity.contractAddress = event.params.contractAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTListedForAuction(
  event: NFTListedForAuctionEvent
): void {
  let entity = new NFTListedForAuction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Contract_id = event.params.id
  entity.seller = event.params.seller
  entity.startingPrice = event.params.startingPrice
  entity.contractAddress = event.params.contractAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTListedForSale(event: NFTListedForSaleEvent): void {
  let entity = new NFTListedForSale(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Contract_id = event.params.id
  entity.seller = event.params.seller
  entity.price = event.params.price
  entity.contractAddress = event.params.contractAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTSold(event: NFTSoldEvent): void {
  let entity = new NFTSold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Contract_id = event.params.id
  entity.buyer = event.params.buyer
  entity.contractAddress = event.params.contractAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
