/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, Input, InputNumber, Divider, Image } from "antd";
import { parseEther, formatEther } from "@ethersproject/units";
import { AddressZero } from "@ethersproject/constants";
import { AddressInput, ManagedRaffle } from "../components";
import { DEFAULT_TICKET_URI } from "../constants";

import { useContractReader, useContractLoader, useFetch } from "../hooks";

export default function Admin({ tx, provider }) {
  const contracts = useContractLoader(provider);

  const [dest, setDest] = useState("");

  const [numTickets, setNumTickets] = useState();
  const [ticketPrice, setTicketPrice] = useState("");
  const [benefactorAddress, setBenefactorAddress] = useState("");
  const [benefactorName, setBenefactorName] = useState("");
  const [ticketURI, setTicketURI] = useState(DEFAULT_TICKET_URI);

  const ticketPreview = useFetch(ticketURI)?.image;

  // Contract-level filtering confines us to static arrays,
  // so we have to filter out the Address-Zero entries here
  const managedRaffles = (useContractReader(contracts, "RaffleFactory", "getManagedRaffles") || []).filter(
    r => r !== AddressZero,
  );

  return (
    <div className="container">
      <div className="section">
        <h2>Create a New Raffle</h2>
      </div>
      <div className="mini-app">
        <div className="side left">
          <div className="input-group">
            <p>Number of Tickets</p>
            <InputNumber
              onChange={e => {
                setNumTickets(e.toString());
              }}
              value={numTickets}
              type="number"
              placeholder="Minimum: 10 | Maximum: 100,000"
              min="10"
              max="100000"
            />
          </div>

          <div className="input-group">
            <p>Price per Ticket (ETH)</p>
            <InputNumber
              onChange={e => {
                setTicketPrice(e.toString());
              }}
              value={ticketPrice}
              placeholder="Minimum: 0.001 ETH"
            />
          </div>

          <div className="input-group">
            <p>Beneficiary Wallet Address</p>
            {/* ENS lets you use real-name aliases for addresses
                Could potentially use this instead of benefactor address...
                We'll fall back to the explicitly given name though */}
            <AddressInput // ensProvider={provider}
              value={benefactorAddress}
              onChange={addr => {
                setBenefactorAddress(addr);
              }}
            />
          </div>

          {/* might not have a name if benefactor is just the artist or some for-profit endeavour where it's not
            really the focus on who is getting the proceeds */}

          <div className="input-group">
            <p>Beneficiary Name</p>
            <Input
              onChange={e => {
                setBenefactorName(e.target.value);
              }}
              value={benefactorName}
              placeholder="Optional"
            />
            {/* TODO refresh upon transaction complete instead of waiting for poll.. */}
          </div>

          <div className="input-group">
            <p>Raffle Wallet Address</p>
            <Input
              disabled={true}
              value={contracts?.RaffleFactory?.address}
              placeholder={contracts?.RaffleFactory?.address}
            />
          </div>

          <Button
            className="action"
            onClick={() => {
              tx(
                contracts.RaffleFactory.createRaffle(
                  Number(numTickets),
                  parseEther(ticketPrice),
                  benefactorAddress,
                  benefactorName,
                  // TODO make customizable.
                  DEFAULT_TICKET_URI,
                ),
              );
            }}
          >
            Launch Raffle
          </Button>
          <div className="subtext">
            Raffle will only be started when NFT is transferred to the raffle wallet.
            <br />{" "}
            <a href="#" target="_blank">
              Click here to find out how.
            </a>
          </div>
        </div>
        <div className="side right">
          <div className="input-group">
            <h3>Customize your ticket</h3>
            <p>Enter a link to the NFT metadata</p>
            <Input
              onChange={e => {
                setTicketURI(e.target.value);
              }}
              value={ticketURI}
            />
          </div>

          <div className="ticket-preview">
            <p className="subtext">Ticket Preview</p>
            {ticketPreview ? <Image src={ticketPreview} className="nft-preview" /> : ""}
            {/* TODO refresh upon transaction complete instead of waiting for poll.. */}
          </div>
        </div>
      </div>
      {/* <div>Raffle Management Contract Address: {contracts?.RaffleFactory?.address}</div> */}
      <div className="section">
        <h2>Your managed raffles:</h2>
        {managedRaffles.map(raffleAddress => {
          return (
            <div key={raffleAddress}>
              <ManagedRaffle raffleAddress={raffleAddress} provider={provider} tx={tx} contracts={contracts} />
              <Divider />
            </div>
          );
        })}
      </div>
    </div>
  );
}
