import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { useLoadContractByAddress, useContractReader } from "../hooks";

import { parseEther, formatEther } from "@ethersproject/units";

import { Button, Input } from "antd";

export default function RaffleDetail({ provider, writeContracts, tx }) {
  // nneed a way to write to the address as well as read

  let { address } = useParams();

  const [numTicketsToBuy, setNumTicketsToBuy] = useState(1);

  const raffleClone = useLoadContractByAddress("Raffle", address, provider);

  // a bulk reader would be dope.. bunch of calls that returns a dict
  const ticketPrice = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketPrice");
  const numTicketsSold = useContractReader({ Raffle: raffleClone }, "Raffle", "numTicketsSold");
  const numInitialTickets = useContractReader({ Raffle: raffleClone }, "Raffle", "numInitialTickets");
  const managerAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "manager");

  // TODO... either iterate through tickets owned by minter
  // or just store a map of num tickets per person
  const ownerOfFirstTicket = useContractReader({ Raffle: raffleClone }, "Raffle", "getTicketOwner", [0]);
  console.log("first owner", ownerOfFirstTicket, numTicketsSold);
  return (
    <div>
      Detail view of raffle, view tickets, enter raffle, etc etc.
      <p>Adress: {address}</p>
      <p>Manager: {managerAddress}</p>
      <p>Tickets Sold: {numTicketsSold ? numTicketsSold.toString() : ""}</p>
      <p>Tickets Initially Available: {numInitialTickets ? numInitialTickets.toString() : ""}</p>
      <p>Your tickets: TODO. need to either track them in raffle, maybe a function that examines them all</p>
      <p>
        Owner of 1st ticket: {ownerOfFirstTicket} (TODO show all tickets owned by you (currenttly connected address)
      </p>
      <p>Ticket price: {ticketPrice ? formatEther(ticketPrice) : ""}</p>
      <div style={{ margin: 8 }}>
        Buy Tickets:
        <Input
          onChange={e => {
            setNumTicketsToBuy(e.target.value);
          }}
          value={numTicketsToBuy}
        />
        <Button
          onClick={() => {
            tx(raffleClone.enter({ value: ticketPrice }));
          }}
        >
          Enter
        </Button>
      </div>
    </div>
  );
}
