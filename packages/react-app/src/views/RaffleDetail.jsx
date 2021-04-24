import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { 
  useLoadContractByAddress, 
  useContractReader, useEventListener, useFetch } from "../hooks";

import { parseEther, formatEther } from "@ethersproject/units";

import { Button, Input, Image } from "antd";

export default function RaffleDetail({ provider, tx, connectedAddress }) {
  // nneed a way to write to the address as well as read

  let { address } = useParams();

  const [numTicketsToBuy, setNumTicketsToBuy] = useState(1);

  const raffleClone = useLoadContractByAddress("Raffle", address, provider);

  // a bulk reader would be dope.. bunch of calls that returns a dict
  const ticketPrice = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketPrice");
  const numTicketsSold = useContractReader({ Raffle: raffleClone }, "Raffle", "numTicketsSold");
  const numInitialTickets = useContractReader({ Raffle: raffleClone }, "Raffle", "numInitialTickets");
  const managerAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "manager");
  const ticketMinterAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketMaker");

  const ownedByYou = useContractReader({ Raffle: raffleClone }, "Raffle", "getTicketBalance", [connectedAddress]);

  const prizeUri = useContractReader({ Raffle: raffleClone }, "Raffle", "getPrizeURI");
  const prizeAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "prizeAddress");

  const prizeMeta = useFetch(prizeUri);
  return (
    <div>
      Detail view of raffle, view tickets, enter raffle, etc etc.
      <p>Connected Address: {connectedAddress}</p>
      <p>Owned by You: {ownedByYou? ownedByYou.toString() : ""}</p>
      <p>Adress: {address}</p>
      <p>Prize URI: {prizeUri}</p>
      <p>Prize metaData: {prizeMeta?JSON.stringify(prizeMeta): ''}</p>
      <p>Prize Address... {prizeAddress}</p>
      <p>Manager: {managerAddress}</p>
      <p>Minting Contract Address: {ticketMinterAddress}</p>
      <p>Tickets Sold: {numTicketsSold ? numTicketsSold.toString() : ""}</p>
      <p>Tickets Initially Available: {numInitialTickets ? numInitialTickets.toString() : ""}</p>
      <p>Your tickets: TODO. need to either track them in raffle, maybe a function that examines them all</p>

      <p>Ticket price: {ticketPrice ? formatEther(ticketPrice) : ""}</p>
      <Image src={prizeMeta?.image} />
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
            tx(raffleClone.enter({ value: ticketPrice * numTicketsToBuy }));
          }}
        >
          Enter
        </Button>
      </div>
    </div>
  );
}
