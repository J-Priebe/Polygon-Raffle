import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <div>
      <img className="logo" src="/logo192.png" alt="Golden Ticket NFT Raffle"/>
    </div>
      // <PageHeader
      //   title="Golden Ticket NFT Raffle"
      //   subTitle="Host NFT Raffles on Layer 2. Your tickets are NFTs too!"
      //   style={{ cursor: "pointer" }}
      // />
  );
}
