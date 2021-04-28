/* eslint-disable jsx-a11y/accessible-emoji */

import React from "react";
import {  Divider, Row } from "antd";
import { Raffle} from "../components";
import { AddressZero } from "@ethersproject/constants";

import { useContractReader } from "../hooks";

export default function Home({ address, provider, contracts}) {
  // Contract-level filtering confines us to static arrays,
  // so we have to filter out the Address-Zero entries here
  const completedRaffles = (useContractReader(contracts, "RaffleFactory", "getCompletedRaffles") || []).filter(
    r => r !== AddressZero,
  );
  const activeRaffles = (useContractReader(contracts, "RaffleFactory", "getActiveRaffles") || []).filter(
    r => r !== AddressZero,
  );

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
        <h2>Current Raffles:</h2>
        <Row>
          {activeRaffles.map(raffleAddress => (
              <Raffle key={raffleAddress} active={true} raffleAddress={raffleAddress} provider={provider} userAddress={address} />
          ))}
        </Row>
        <Divider />

        <h2> Past Raffles: </h2>
        <Row>
          {completedRaffles.map(raffleAddress => (
              <Raffle key={raffleAddress} active={false} raffleAddress={raffleAddress} provider={provider} userAddress={address} />
          ))}
        </Row>
      </div>
    </div>
  );
}
