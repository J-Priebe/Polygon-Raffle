/* eslint-disable jsx-a11y/accessible-emoji */

import React from "react";
import { Divider, Row } from "antd";
import { Raffle, RaffleDetail } from "../components";
import { AddressZero } from "@ethersproject/constants";

import { useContractReader } from "../hooks";

export default function Home({ address, readProvider, writeProvider, contracts, tx }) {
  // Contract-level filtering confines us to static arrays,
  // so we have to filter out the Address-Zero entries here
  const completedRaffles = (useContractReader(contracts, "RaffleFactory", "getCompletedRaffles") || []).filter(
    r => r !== AddressZero,
  );
  const activeRaffles = (useContractReader(contracts, "RaffleFactory", "getActiveRaffles") || []).filter(
    r => r !== AddressZero,
  );

  return (
    <div className="container">
      <div>
        <h2>Current Raffles</h2>
          {activeRaffles.map(raffleAddress => (
            <RaffleDetail
              key={raffleAddress}
              active={true}
              raffleAddress={raffleAddress}
              readProvider={readProvider}
              writeProvider={writeProvider}
              connectedAddress={address}
              tx={tx}
            />
          ))}
        <Divider />

        <h2>Past Raffles</h2>
        <Row>
          {completedRaffles.map(raffleAddress => (
            <Raffle
              key={raffleAddress}
              active={false}
              raffleAddress={raffleAddress}
              provider={readProvider}
              userAddress={address}
            />
          ))}
        </Row>
      </div>
    </div>
  );
}
