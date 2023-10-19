import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Initialized,
  NFTBid,
  NFTListedForAuction,
  NFTListedForSale,
  NFTSold
} from "../generated/Contract/Contract"

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}

export function createNFTBidEvent(
  id: BigInt,
  bidder: Address,
  amount: BigInt
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

  return nftBidEvent
}

export function createNFTListedForAuctionEvent(
  id: BigInt,
  seller: Address,
  startingPrice: BigInt
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

  return nftListedForAuctionEvent
}

export function createNFTListedForSaleEvent(
  id: BigInt,
  seller: Address,
  price: BigInt
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

  return nftListedForSaleEvent
}

export function createNFTSoldEvent(id: BigInt, buyer: Address): NFTSold {
  let nftSoldEvent = changetype<NFTSold>(newMockEvent())

  nftSoldEvent.parameters = new Array()

  nftSoldEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  nftSoldEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )

  return nftSoldEvent
}
