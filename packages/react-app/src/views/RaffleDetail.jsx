import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { 
  useCustomContractLoader, 
  useContractReader, useFetch } from "../hooks";

import { parseEther, formatEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";


import { Button, Input, InputNumber, Image } from "antd";

export default function RaffleDetail({ provider, tx, connectedAddress }) {

  let { address } = useParams();

  const [numTicketsToBuy, setNumTicketsToBuy] = useState(1);

  const raffleClone = useCustomContractLoader(provider, "Raffle", address);

  // a bulk reader would be dope.. bunch of calls that returns a dict
  const ticketPrice = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketPrice");
  const numTicketsSold = useContractReader({ Raffle: raffleClone }, "Raffle", "numTicketsSold");
  const numInitialTickets = useContractReader({ Raffle: raffleClone }, "Raffle", "numInitialTickets");
  // const managerAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "manager");
  // const ticketMinterAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketMinter");

  const ownedByYou = useContractReader({ Raffle: raffleClone }, "Raffle", "getTicketBalance", [connectedAddress]);

  const prizeUri = useContractReader({ Raffle: raffleClone }, "Raffle", "getPrizeURI");
  // const prizeAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "prizeAddress");
  const ticketUri = useContractReader({Raffle: raffleClone }, "Raffle", "ticketURI");

  const prizeMeta = useFetch(prizeUri);
  const ticketMeta = useFetch(ticketUri);
  return (
    <div>
      <p>Owned by You: {ownedByYou? ownedByYou.toString() : ""}</p>
      <p>TODO actually show your ticket NFTs here</p>
      <p>Could even have a secondary marketplace built right in where
        ticket owners provide their contact info and list them for resale.
      </p>
      <p>Tickets Sold: {numTicketsSold ? numTicketsSold.toString() : ""}</p>
      <p>Tickets Initially Available: {numInitialTickets ? numInitialTickets.toString() : ""}</p>

      <p>Ticket price: {ticketPrice ? formatEther(ticketPrice) : "--"} ETH</p>
      <Image src={prizeMeta?.image} />
      
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
          onClick={() => {
            // ticketPrice is in wei, the numbers we work with
            // are likely outside range of safe javascript integers
            const val = ticketPrice.mul(numTicketsToBuy);
            // how do we handle big numbers?
            console.log('sending value:', val);
            tx(raffleClone.enter({ value: val }));
          }}
        >
          Enter
        </Button>
      </div>
    </div>
  );
}
