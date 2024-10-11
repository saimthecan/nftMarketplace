import React from "react";
import "./NftEmpty.css"; // CSS dosyasını import ediyoruz

const NFTListEmpty = ({ text, imageSrc }) => {
  return (
    <div className="container" >
      <div className="content-box" >
      <p dangerouslySetInnerHTML={{ __html: text }} />
      </div>
      <img className="image" src={imageSrc} alt="NFT Character" />
    </div>
  );
};

export default NFTListEmpty;
