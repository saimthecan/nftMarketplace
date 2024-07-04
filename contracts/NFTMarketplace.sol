// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract NFTMarketplace is ReentrancyGuard {
    constructor(address _owner) {
        owner = _owner;
    }

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
            require(
                _auctionStartTime >= block.timestamp,
                "Auction start time must be in the future"
            );
            require(
                _auctionEndTime > _auctionStartTime,
                "Auction end time must be after the start time"
            );

            NFT.transferFrom(msg.sender, address(this), _tokenId);
        } else {
            IERC1155 NFT = IERC1155(_contractAddress);
            require(NFT.balanceOf(msg.sender, _tokenId) >= _quantity);
            require(
                _auctionStartTime >= block.timestamp,
                "Auction start time must be in the future"
            );
            require(
                _auctionEndTime > _auctionStartTime,
                "Auction end time must be after the start time"
            );

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

        uint256 price = (msg.value * 95) / 100;
        // Ödeme satıcıya
        (bool successSeller, ) = payable(item.seller).call{value: price}("");
        require(successSeller, "Transfer to seller failed.");

        // Platform ücreti
        (bool successOwner, ) = payable(owner).call{value: msg.value - price}(
            ""
        );
        require(successOwner, "Transfer to owner failed.");

        if (item.nftType == NFTType.ERC721) {
            IERC721(item.contractAddress).transferFrom(
                address(this),
                msg.sender,
                item.tokenId
            );
        } else {
            IERC1155(item.contractAddress).safeTransferFrom(
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

        bool isAuctionStarted = block.timestamp >= item.auctionStartTime;
        bool isAuctionEnded = block.timestamp > item.auctionEndTime;
        bool isAfterClaimPeriod = block.timestamp >
            item.auctionEndTime + 5 days;
        bool noBids = item.buyer == address(0);

        // Açık artırmayı iptal etme koşulları:
        // Eğer açık artırma başladıysa ve hiç teklif alınmadıysa, açık artırma iptal edilebilir.
        // Eğer açık artırma sona erdiyse ve 5 gün boyunca NFT claim edilmediyse, açık artırma iptal edilebilir.
        require(
            (isAuctionStarted && noBids) ||
                (isAuctionEnded && isAfterClaimPeriod),
            "Cannot cancel auction under these conditions"
        );

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
        require(
            block.timestamp >= item.auctionStartTime,
            "Auction has not started yet"
        );
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
        require(
            block.timestamp >= item.auctionEndTime,
            "Auction not yet ended"
        );
        require(!item.state, "Auction already finished");
        require(msg.sender == item.buyer, "You are not the highest bidder");

        uint256 ownerCommission = (item.price * 5) / 100; // %5 komisyon
        uint256 sellerAmount = item.price - ownerCommission;

        // Satıcıya ödeme
        (bool successSeller, ) = payable(item.seller).call{value: sellerAmount}(
            ""
        );
        require(successSeller, "Transfer to seller failed.");

        // Platform sahibine komisyon
        (bool successOwner, ) = payable(owner).call{value: ownerCommission}("");
        require(successOwner, "Transfer to owner failed.");

        if (item.nftType == NFTType.ERC721) {
            IERC721(item.contractAddress).transferFrom(
                address(this),
                msg.sender,
                item.tokenId
            );
        } else {
            IERC1155(item.contractAddress).safeTransferFrom(
                address(this),
                msg.sender,
                item.tokenId,
                item.quantity,
                ""
            );
        }

        item.state = true;
        emit NFTAuctionFinished(
            Id,
            msg.sender,
            item.contractAddress,
            item.tokenId
        );
    }

    function approveNFT(
        NFTType _type,
        address _contractAddress,
        uint256 _tokenId
    ) external {
        if (_type == NFTType.ERC721) {
            IERC721 erc721Contract = IERC721(_contractAddress);
            require(
                erc721Contract.ownerOf(_tokenId) == msg.sender,
                "Caller is not the token owner"
            );
            erc721Contract.approve(address(this), _tokenId);
        } else if (_type == NFTType.ERC1155) {
            IERC1155 erc1155Contract = IERC1155(_contractAddress);
            require(
                erc1155Contract.isApprovedForAll(msg.sender, address(this)) ==
                    false,
                "Contract is already approved"
            );
            erc1155Contract.setApprovalForAll(address(this), true);
        }
    }

    function isTokenApproved(
        NFTType _type,
        address _contractAddress,
        uint256 _tokenId,
        address _operator,
        address _owner // Yeni parametre
    ) external view returns (bool) {
        if (_type == NFTType.ERC721) {
            IERC721 nftContract = IERC721(_contractAddress);
            return nftContract.getApproved(_tokenId) == _operator;
        } else if (_type == NFTType.ERC1155) {
            IERC1155 nftContract = IERC1155(_contractAddress);
            return nftContract.isApprovedForAll(_owner, _operator);
        }
        return false;
    }
}
