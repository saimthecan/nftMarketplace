import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  NFTAuctionCancelled,
  NFTAuctionFinished,
  NFTBid,
  NFTListedForAuction,
  NFTListedForSale,
  NFTSaleCancelled,
  NFTSold
} from "../generated/NFTMarketplace/NFTMarketplace"

export function createNFTAuctionCancelledEvent(
  id: BigInt,
  seller: Address,
  contractAddress: Address,
  tokenId: BigInt
): NFTAuctionCancelled {
  let nftAuctionCancelledEvent = changetype<NFTAuctionCancelled>(newMockEvent())

  nftAuctionCancelledEvent.parameters = new Array()

  nftAuctionCancelledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftAuctionCancelledEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  nftAuctionCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  nftAuctionCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nftAuctionCancelledEvent
}

export function createNFTAuctionFinishedEvent(
  id: BigInt,
  buyer: Address,
  contractAddress: Address,
  tokenId: BigInt
): NFTAuctionFinished {
  let nftAuctionFinishedEvent = changetype<NFTAuctionFinished>(newMockEvent())

  nftAuctionFinishedEvent.parameters = new Array()

  nftAuctionFinishedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftAuctionFinishedEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  nftAuctionFinishedEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  nftAuctionFinishedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nftAuctionFinishedEvent
}

export function createNFTBidEvent(
  id: BigInt,
  bidder: Address,
  amount: BigInt,
  contractAddress: Address,
  tokenId: BigInt
): NFTBid {
  let nftBidEvent = changetype<NFTBid>(newMockEvent())

  nftBidEvent.parameters = new Array()

  nftBidEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftBidEvent.parameters.push(
    new ethereum.EventParam("bidder", ethereum.Value.fromAddress(bidder))
  )
  nftBidEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  nftBidEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  nftBidEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nftBidEvent
}

export function createNFTListedForAuctionEvent(
  id: BigInt,
  seller: Address,
  startingPrice: BigInt,
  contractAddress: Address,
  tokenId: BigInt,
  auctionStartTime: BigInt,
  auctionEndTime: BigInt
): NFTListedForAuction {
  let nftListedForAuctionEvent = changetype<NFTListedForAuction>(newMockEvent())

  nftListedForAuctionEvent.parameters = new Array()

  nftListedForAuctionEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftListedForAuctionEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  nftListedForAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "startingPrice",
      ethereum.Value.fromUnsignedBigInt(startingPrice)
    )
  )
  nftListedForAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  nftListedForAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftListedForAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "auctionStartTime",
      ethereum.Value.fromUnsignedBigInt(auctionStartTime)
    )
  )
  nftListedForAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "auctionEndTime",
      ethereum.Value.fromUnsignedBigInt(auctionEndTime)
    )
  )

  return nftListedForAuctionEvent
}

export function createNFTListedForSaleEvent(
  id: BigInt,
  seller: Address,
  price: BigInt,
  contractAddress: Address,
  tokenId: BigInt
): NFTListedForSale {
  let nftListedForSaleEvent = changetype<NFTListedForSale>(newMockEvent())

  nftListedForSaleEvent.parameters = new Array()

  nftListedForSaleEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftListedForSaleEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  nftListedForSaleEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  nftListedForSaleEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  nftListedForSaleEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nftListedForSaleEvent
}

export function createNFTSaleCancelledEvent(
  id: BigInt,
  seller: Address,
  contractAddress: Address,
  tokenId: BigInt
): NFTSaleCancelled {
  let nftSaleCancelledEvent = changetype<NFTSaleCancelled>(newMockEvent())

  nftSaleCancelledEvent.parameters = new Array()

  nftSaleCancelledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftSaleCancelledEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  nftSaleCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  nftSaleCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nftSaleCancelledEvent
}

export function createNFTSoldEvent(
  id: BigInt,
  buyer: Address,
  contractAddress: Address,
  tokenId: BigInt
): NFTSold {
  let nftSoldEvent = changetype<NFTSold>(newMockEvent())

  nftSoldEvent.parameters = new Array()

  nftSoldEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftSoldEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  nftSoldEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  nftSoldEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nftSoldEvent
}
