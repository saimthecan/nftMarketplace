import React from "react";
import "./NFTListEmpty.css"; // CSS dosyasını import ediyoruz
import noNft from "../assests/nonft.png";

const NFTListEmpty = () => {
  return (
    <div className="container">
      <div className="content-box">
        <p>
          "Shelves are empty, and so is our spirit...<br /> Maybe an NFT would bring a little joy. 😢"
        </p>
      </div>
      <img className="image" src={noNft} alt="NFT Character" />
    </div>
  );
};

export default NFTListEmpty;
