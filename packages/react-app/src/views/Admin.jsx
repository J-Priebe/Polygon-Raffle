/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { SAMPLE_JSON_URI } from "../constants";
import { Button, Input } from "antd";
import { parseEther, formatEther } from "@ethersproject/units";
import { AddressZero } from "@ethersproject/constants";
import { AddressInput } from "../components";

import { useEventListener, useContractReader, useContractLoader } from "../hooks";

export default function Admin({ tx, provider }) {

  const contracts = useContractLoader(provider)


  const [dest, setDest] = useState("");

  const [numTickets, setNumTickets] = useState(100);
  const [ticketPrice, setTicketPrice] = useState("0.01");
  const [benefactorAddress, setBenefactorAddress] = useState("");
  const [benefactorName, setBenefactorName] = useState("");

  const managedRaffles = (
    useContractReader(contracts, "RaffleFactory", "getManagedRaffles")
    || []
  ).filter(r => r !== AddressZero);
  const completedRaffles = (
    useContractReader(contracts, "RaffleFactory", "getCompletedRaffles")
    || []
  ).filter(r => r !== AddressZero);
  const activeRaffles = (
    useContractReader(contracts, "RaffleFactory", "getActiveRaffles")
    || []
  ).filter(r => r !== AddressZero);

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
        <h2>Send Prize NFT to address</h2>
        uri: {SAMPLE_JSON_URI}
        <div style={{ margin: 8 }}>
          Address:
          <Input
            onChange={e => {
              setDest(e.target.value);
            }}
            value={dest}
          />
          <Button
            onClick={() => {
              console.log("sending prize to", dest, SAMPLE_JSON_URI);
              tx(contracts.SamplePrizeNFT.sendPrize(dest, SAMPLE_JSON_URI));
            }}
          >
            Send Prize
          </Button>
        </div>
      </div>
      <h2> Your managed raffles: </h2>
      TODO show the onens missing prizes, ability to draw, etc.
      <p> managed: {managedRaffles}</p>
      <p> active: {activeRaffles}</p>
      <p> completed: {completedRaffles}</p>

      <h2>Launch a new Raffle:</h2>
      <div style={{ margin: 8 }}>
        Num Tickets :
        <Input
          onChange={e => {
            setNumTickets(e.target.value);
          }}
          value={numTickets}
        />
        Ticket Price (ETH):
        <Input
          onChange={e => {
            setTicketPrice(e.target.value);
          }}
          value={ticketPrice}
        />
        Benefactor Address:
        <div style={{ width: 350, padding: 16, margin: "auto" }}>
          {/*
      ENS lets you use real-name aliases for addresses
      Could potentially use this instead of benefactor address...
      We'll fall back to the explicitly given name though
    */}
          <AddressInput
            // ensProvider={provider}
            value={benefactorAddress}
            onChange={addr => {
              setBenefactorAddress(addr);
            }}
          />
        </div>
        {/* might not have a name if benefactor is just the artist or some for-profit endeavour where
  it's not really the focus on who is getting the proceeds */}
        Benefactor Name (Optional):
        <Input
          onChange={e => {
            setBenefactorName(e.target.value);
          }}
          value={benefactorName}
        />
        {/* TODO refresh upon transaction complete instead of waiting for poll.. */}
        <Button
          onClick={() => {
            tx(
              contracts.RaffleFactory.createRaffle(
                Number(numTickets),
                parseEther(ticketPrice),
                benefactorAddress,
                benefactorName,
              ),
            );
          }}
        >
          Launch Raffle
        </Button>
      </div>
      <div>After launching, donor must sent the prize NFT to the address of the raffle.</div>
    </div>
  );
}
