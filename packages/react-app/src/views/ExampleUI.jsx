/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance, Raffle } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";

export default function ExampleUI({
  raffles,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [numTickets, setNumTickets] = useState(100);
  const [ticketPrice, setTicketPrice] = useState(1000000);
  const [benefactorAddress, setBenfactorAddress] = useState();

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
        <h2>All Raffles:</h2>
        {(raffles || []).map(raffle => (
          <div key={raffle}>
            <Raffle raffleAddress={raffle} provider={localProvider} />
          </div>
        ))}

        <Divider />

        <h2>Launch a new Raffle:</h2>

        <div style={{ margin: 8 }}>
          Num Tickets :
          <Input
            onChange={e => {
              setNumTickets(e.target.value);
            }}
            value={numTickets}
          />
          Ticket Price (wei):
          <Input
            onChange={e => {
              setTicketPrice(e.target.value);
            }}
            value={ticketPrice}
          />
          Benefactor Address:
          <Input
            onChange={e => {
              setBenfactorAddress(e.target.value);
            }}
            value={benefactorAddress}
          />
          <Button
            onClick={() => {
              tx(writeContracts.RaffleFactory.createRaffle(numTickets, ticketPrice, benefactorAddress));
            }}
          >
            Launch Raffle
          </Button>
        </div>

        <div>After launching, donor must sent the prize NFT to the address of the raffle.</div>
      </div>
    </div>
  );
}
