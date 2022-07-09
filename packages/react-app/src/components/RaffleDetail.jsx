import React, { useState } from "react";

import { useCustomContractLoader, useContractReader, useFetch } from "../hooks";

import { formatEther } from "@ethersproject/units";

import { Button, Col, Input, InputNumber, Image, Row } from "antd";

export default function RaffleDetail({ readProvider, writeProvider, tx, raffleAddress, connectedAddress }) {
  const [numTicketsToBuy, setNumTicketsToBuy] = useState(1);

  const raffleClone = useCustomContractLoader(writeProvider || readProvider, "Raffle", raffleAddress);

  // a bulk reader would be dope.. bunch of calls that returns a dict
  const ticketPrice = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketPrice");
  const numTicketsSold = useContractReader({ Raffle: raffleClone }, "Raffle", "numTicketsSold");
  const numInitialTickets = useContractReader({ Raffle: raffleClone }, "Raffle", "numInitialTickets");
  // const managerAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "manager");
  // const ticketMinterAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketMinter");
  const donorAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "donor");

  const ownedByYou = useContractReader({ Raffle: raffleClone }, "Raffle", "getTicketBalance", [connectedAddress]);

  const prizeUri = useContractReader({ Raffle: raffleClone }, "Raffle", "getPrizeURI");
  // const prizeAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "prizeAddress");
  const ticketUri = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketURI");

  const benefactorName = useContractReader({ Raffle: raffleClone }, "Raffle", "benefactorName");
  const benefactorAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "benefactor");

  const prizeData = useFetch(prizeUri);
  const prizeTitle = prizeData?.name || "---";
  const prizeDescription = prizeData?.description || "---";

  const drawInProgress = useContractReader({ Raffle: raffleClone }, "Raffle", "drawInProgress");

  const maxPrizeValue = ticketPrice && numInitialTickets ? ticketPrice.mul(numInitialTickets) : undefined;

  const ticketMeta = useFetch(ticketUri);

  // hey, it's a demo and we can pretend all NFTs will have an
  // artist attribute even though it's not part of the official spec
  const artist = prizeData?.attributes?.artist || "Unknown Artist";

  const connected = !!writeProvider;

  return (
    <div>
      <div className="mini-app">
        <div className="side left v-container">
          <div className="v-content"><Image src={prizeData?.image} className="nft-preview"/></div>
        </div>
        <div className="side right">
          <div className="prize-info">
            <h3 className="prize-title">{prizeTitle}</h3>
            <p className="prize-description">{prizeDescription}</p>
            <p className="prize-artist">by <span className="letslight">{artist}</span></p>
          </div>
          <div className="donation-info">
            <p>Donated by<br/><span className="letslight">{donorAddress}</span></p>
            <p>For the benefit of<br/><span className="letslight">{benefactorName ? benefactorName : benefactorAddress}</span></p>
          </div>
          <div className="raffle-action">
            <div className="bloc">
              <div className="metric">Projected Value</div>
              <div className="value">{maxPrizeValue ? formatEther(maxPrizeValue) : "--"} Ξ</div>
              <div className="extra">$ 6,666.66</div>
            </div>
            <div className="bloc">
              <div className="metric">Tickets Sold</div>
                <div className="value">{numTicketsSold ? numTicketsSold.toString() : "--"}<span className="total-tix">/{numInitialTickets ? numInitialTickets.toString() : ""}</span></div>
                <div className="extra">{((numTicketsSold / numInitialTickets) * 100).toFixed(2).toString()} %</div>
            </div>
          </div>
          <div className="action">
            <div className="right">
              <div className="ticket-image"><Image src={ticketMeta?.image} className="nft-preview" /></div>
              <div className="extra"> Each ticket is an NFT represented above.</div>
            </div>
            <div className="action-box left">
              <div className="ticket-no">
                <div className="extra">Number of Tickets</div>
                <InputNumber
                  min={1}
                  onChange={v => {
                    setNumTicketsToBuy(v);
                  }}
                  value={numTicketsToBuy}
                />
              </div>
              <div className="price-info">
                <div className="metric">You'll spend</div>
                <div className="value">{ticketPrice ? `${(formatEther(ticketPrice) * numTicketsToBuy).toFixed(5)} Ξ` : "--"}</div>
                <div className="extra">Odds: {((numTicketsToBuy/numInitialTickets) * 100).toFixed(2)} %</div>
              </div>
              <Button
                disabled={drawInProgress || !connected}
                onClick={() => {
                  // ticketPrice is in wei, the numbers we work with
                  // are likely outside range of safe javascript integers
                  const val = ticketPrice.mul(numTicketsToBuy);
                  tx(raffleClone.enter({ value: val }));
                }}>
                  {drawInProgress ? "Draw in Progress" : connected ? "Buy Tickets" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
