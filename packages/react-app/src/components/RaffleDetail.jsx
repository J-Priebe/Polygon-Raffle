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

  const prizeData = useFetch(prizeUri);
  const prizeTitle = prizeData?.name || "---";
  const prizeDescription = prizeData?.description || "---";

  const drawInProgress = useContractReader({ Raffle: raffleClone }, "Raffle", "drawInProgress");

  const maxPrizeValue = ticketPrice && numInitialTickets ? ticketPrice.mul(numInitialTickets) : undefined;

  const ticketMeta = useFetch(ticketUri);

  // hey, it's a demo and we can pretend all NFTs will have an
  // artist atrribute even though it's not part of the official spec
  const artist = "Beeple";

  const connected = !!writeProvider;

  return (
    <div>
      <Row justify="center" align="middle">
        <Col>
          <Row>
            <Col>By: {artist}</Col>
          </Row>
          <Row align="middle">
            {/* IMAGE */}
            <Col>
              <Image src={prizeData?.image} width={300} height={300} />
            </Col>
            {/* METADATA */}
            <Col>
              <Row>
                <Col>{prizeTitle}</Col>
              </Row>
              <Row>
                <Col>{prizeDescription}</Col>
              </Row>
              <Row>
                <Col>Donated by:</Col>
              </Row>
              <Row>
                <Col>{donorAddress}</Col>
              </Row>
              <Row>
                <Col>&#x2764;For the benefit of:</Col>
              </Row>
              <Row>
                <Col>{benefactorName}</Col>
              </Row>
            </Col>
          </Row>
          {/* PRICE AND TICKET DATA */}
          <Row>
            <Col span={6}>
              <Row>Ticket Price</Row>
              <Row>{ticketPrice ? formatEther(ticketPrice) : "--"} MATIC</Row>
            </Col>
            <Col span={6}>
              <Row>Tickets Sold</Row>
              <Row>{numTicketsSold ? numTicketsSold.toString() : "--"}</Row>
              <Row>OF {numInitialTickets ? numInitialTickets.toString() : ""}</Row>
            </Col>
            <Col span={6}>
              <Row>Tickets Owned</Row>
              <Row>{ownedByYou ? ownedByYou.toString() : "--"}</Row>
            </Col>
            <Col span={6}>
              <Row>Projected Art Value</Row> <Row>{maxPrizeValue ? formatEther(maxPrizeValue) : "--"}</Row>
            </Col>
          </Row>
        </Col>
      </Row>

      <div style={{ margin: 8 }}>
        <Image src={ticketMeta?.image} width={50} height={50} />
        <InputNumber
          min={1}
          onChange={v => {
            setNumTicketsToBuy(v);
          }}
          value={numTicketsToBuy}
        />
        <Button
          disabled={!connected}
          onClick={() => {
            // ticketPrice is in wei, the numbers we work with
            // are likely outside range of safe javascript integers
            const val = ticketPrice.mul(numTicketsToBuy);
            tx(raffleClone.enter({ value: val }));
          }}
        >
          {drawInProgress ? "Draw in Progress" : connected ? "Buy Tickets" : "Connect wallet to buy tickets"}
        </Button>
      </div>
    </div>
  );
}
