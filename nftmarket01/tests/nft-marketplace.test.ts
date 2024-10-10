import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { NFTAuctionCancelled } from "../generated/schema"
import { NFTAuctionCancelled as NFTAuctionCancelledEvent } from "../generated/NFTMarketplace/NFTMarketplace"
import { handleNFTAuctionCancelled } from "../src/nft-marketplace"
import { createNFTAuctionCancelledEvent } from "./nft-marketplace-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let id = BigInt.fromI32(234)
    let seller = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let contractAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let tokenId = BigInt.fromI32(234)
    let newNFTAuctionCancelledEvent = createNFTAuctionCancelledEvent(
      id,
      seller,
      contractAddress,
      tokenId
    )
    handleNFTAuctionCancelled(newNFTAuctionCancelledEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("NFTAuctionCancelled created and stored", () => {
    assert.entityCount("NFTAuctionCancelled", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "NFTAuctionCancelled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seller",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "NFTAuctionCancelled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "contractAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "NFTAuctionCancelled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
