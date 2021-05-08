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
    <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
      <h2>Current Raffles:</h2>
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
      {completedRaffles?.length ? (
        <Row>
          <h2> Past Raffles: </h2>
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
      ) : null}
    </div>
  );
}
