// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarketplace is ReentrancyGuard {
   constructor(address _owner) {
        owner = _owner;
    }

    using SafeMath for uint256;

    address public owner;
    uint256 public idForSale;
    uint256 public idForAuction;

    event NFTListedForSale(
        uint256 indexed id,
        address indexed seller,
        uint256 price,
        address contractAddress,
        uint256 tokenId
    );
    event NFTListedForAuction(
        uint256 indexed id,
        address indexed seller,
        uint256 startingPrice,
        address contractAddress,
        uint256 tokenId,
        uint256 auctionStartTime,
        uint256 auctionEndTime
    );
    event NFTSold(
        uint256 indexed id,
        address indexed buyer,
        address contractAddress,
        uint256 tokenId
    );
    event NFTBid(
        uint256 indexed id,
        address indexed bidder,
        uint256 amount,
        address contractAddress,
        uint256 tokenId
    );
    event NFTAuctionCancelled(
        uint256 indexed id,
        address indexed seller,
        address contractAddress,
        uint256 tokenId
    );
    event NFTAuctionFinished(
        uint256 indexed id,
        address indexed buyer,
        address contractAddress,
        uint256 tokenId
    );

    event NFTSaleCancelled(
    uint256 indexed id,
    address indexed seller,
    address contractAddress,
    uint256 tokenId
);


    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

  

    enum NFTType {
        ERC721,
        ERC1155
    }

    struct Item {
        NFTType nftType;
        address contractAddress;
        address seller;
        address buyer;
        uint256 price;
        uint256 tokenId;
        uint256 quantity;
        bool state;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
    }

    mapping(uint256 => Item) public idToItemForSale;
    mapping(uint256 => Item) public idToItemForAuction;

    function startNFTSale(
        NFTType _type,
        address _contractAddress,
        uint256 _price,
        uint256 _tokenId,
        uint256 _quantity
    ) public {
        Item storage item = idToItemForSale[idForSale];
        item.nftType = _type;
        item.contractAddress = _contractAddress;
        item.seller = msg.sender;
        item.price = _price;
        item.tokenId = _tokenId;
        item.quantity = _quantity;
        item.state = false;

        if (_type == NFTType.ERC721) {
            IERC721 NFT = IERC721(_contractAddress);
            require(NFT.ownerOf(_tokenId) == msg.sender);
            NFT.transferFrom(msg.sender, address(this), _tokenId);
        } else {
            IERC1155 NFT = IERC1155(_contractAddress);
            require(NFT.balanceOf(msg.sender, _tokenId) >= _quantity);
            NFT.safeTransferFrom(
                msg.sender,
                address(this),
                _tokenId,
                _quantity,
                ""
            );
        }

        emit NFTListedForSale(
            idForSale,
            msg.sender,
            _price,
            item.contractAddress,
            item.tokenId
        );
        idForSale++;
    }

    function startNFTAuction(
        NFTType _type,
        address _contractAddress,
        uint256 _price,
        uint256 _tokenId,
        uint256 _quantity,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime
    ) public {
        Item storage item = idToItemForAuction[idForAuction];
        item.nftType = _type;
        item.contractAddress = _contractAddress;
        item.seller = msg.sender;
        item.price = _price;
        item.tokenId = _tokenId;
        item.quantity = _quantity;
        item.state = false; // NFT henüz satılmadı

        if (_type == NFTType.ERC721) {
            IERC721 NFT = IERC721(_contractAddress);
            require(NFT.ownerOf(_tokenId) == msg.sender);
            NFT.transferFrom(msg.sender, address(this), _tokenId);
        } else {
            IERC1155 NFT = IERC1155(_contractAddress);
            require(NFT.balanceOf(msg.sender, _tokenId) >= _quantity);
            NFT.safeTransferFrom(
                msg.sender,
                address(this),
                _tokenId,
                _quantity,
                ""
            );
        }
        item.auctionStartTime = _auctionStartTime;
        item.auctionEndTime = _auctionEndTime;
        emit NFTListedForAuction(
            idForAuction,
            msg.sender,
            _price,
            item.contractAddress,
            item.tokenId,
            _auctionStartTime,
            _auctionEndTime 
        );
        idForAuction++;
    }

    function buyNFT(uint256 _id) public payable nonReentrant {
      Item storage item = idToItemForSale[_id];
    require(item.seller != address(0), "Item does not exist");
    require(msg.sender != item.seller, "Seller cannot buy their own item");
    require(!item.state, "Item is already sold");
    require(item.buyer == address(0), "Item is already reserved");
    require(msg.value >= item.price, "Insufficient payment");

        uint256 price = msg.value.mul(95).div(100);
        payable(item.seller).transfer(price);
        payable(owner).transfer(msg.value.sub(price));

        if (item.nftType == NFTType.ERC721) {
            IERC721 NFT = IERC721(item.contractAddress);
            NFT.transferFrom(address(this), msg.sender, item.tokenId);
        } else {
            IERC1155 NFT = IERC1155(item.contractAddress);
            NFT.safeTransferFrom(
                address(this),
                msg.sender,
                item.tokenId,
                item.quantity,
                ""
            );
        }

        item.buyer = msg.sender;
        item.state = true;
        emit NFTSold(_id, msg.sender, item.contractAddress, item.tokenId);
    }

    function changeOwner(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner address is invalid.");
        owner = _newOwner;
    }

    function isNFTApprovedForMarketplace(
        NFTType _type,
        address _contractAddress,
        address _ownerAddress
    ) public view returns (bool) {
        if (_type == NFTType.ERC721) {
            IERC721 NFT = IERC721(_contractAddress);
            return NFT.isApprovedForAll(_ownerAddress, address(this));
        } else if (_type == NFTType.ERC1155) {
            IERC1155 NFT = IERC1155(_contractAddress);
            return NFT.isApprovedForAll(_ownerAddress, address(this));
        }
        return false;
    }

   function cancelNFTSale(uint256 Id) public {
    Item storage item = idToItemForSale[Id];
    require(item.seller == msg.sender, "You are not owner of this NFT!");
    require(!item.state, "This NFT sold!");

    if (item.nftType == NFTType.ERC721) {
        IERC721 NFT = IERC721(item.contractAddress);
        NFT.transferFrom(address(this), msg.sender, item.tokenId);
    } else {
        IERC1155 NFT = IERC1155(item.contractAddress);
        NFT.safeTransferFrom(
            address(this),
            msg.sender,
            item.tokenId,
            item.quantity,
            ""
        );
    }

    item.state = true; // Mark as cancelled

    emit NFTSaleCancelled(
        Id,
        msg.sender,
        item.contractAddress,
        item.tokenId
    );
}


 function cancelNFTAuction(uint256 Id) public {
    Item storage item = idToItemForAuction[Id];
    require(item.seller == msg.sender, "You are not owner of this NFT!");
    require(!item.state, "This NFT sold!");

    if (item.buyer != address(0)) {
        // Eğer bir önceki teklif varsa, önceki alıcıya önceki teklif miktarını geri öde
        payable(item.buyer).transfer(item.price);
    }

    if (item.nftType == NFTType.ERC721) {
        IERC721 NFT = IERC721(item.contractAddress);
        NFT.transferFrom(address(this), msg.sender, item.tokenId);
    } else {
        IERC1155 NFT = IERC1155(item.contractAddress);
        NFT.safeTransferFrom(
            address(this),
            msg.sender,
            item.tokenId,
            item.quantity,
            ""
        );
    }

    item.state = true; // Mark as cancelled
    emit NFTAuctionCancelled(
        Id,
        msg.sender,
        item.contractAddress,
        item.tokenId
    );
}

    function bid(uint256 Id) public payable {
        Item storage item = idToItemForAuction[Id];
        require(block.timestamp >= item.auctionStartTime, "Auction has not started yet");
        require(block.timestamp <= item.auctionEndTime, "Auction has ended");
        require(msg.sender != item.seller, "You are seller");
        require(msg.sender != item.buyer, "You have highest bid!");
        require(msg.value > item.price, "Wrong Price!"); // Teklif, önceki tekliften yüksek olmalı
        require(!item.state, "Cannot buy!");

        if (item.buyer != address(0)) {
            // Eğer bir önceki teklif varsa, önceki alıcıya önceki teklif miktarını geri öde
            payable(item.buyer).transfer(item.price);
        }
        item.buyer = msg.sender;
        item.price = msg.value;

        emit NFTBid(
            Id,
            msg.sender,
            msg.value,
            item.contractAddress,
            item.tokenId
        );
    }

    function finishNFTAuction(uint256 Id) public {
    Item storage item = idToItemForAuction[Id];
    require(msg.sender == item.buyer, "You are not the highest bidder");
    require(!item.state, "Auction already finished");
    require(block.timestamp >= item.auctionEndTime, "Auction not yet ended");

    uint256 ownerCommission = item.price.mul(5).div(100); // %5 komisyon
    uint256 sellerAmount = item.price.sub(ownerCommission);

    payable(item.seller).transfer(sellerAmount);
    payable(owner).transfer(ownerCommission);

    if (item.nftType == NFTType.ERC721) {
        IERC721(item.contractAddress).transferFrom(address(this), msg.sender, item.tokenId);
    } else {
        IERC1155(item.contractAddress).safeTransferFrom(address(this), msg.sender, item.tokenId, item.quantity, "");
    }

    item.state = true;
    emit NFTAuctionFinished(Id, msg.sender, item.contractAddress, item.tokenId);
}


}
