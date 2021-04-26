/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, Divider, Input, Row, Col, Image } from "antd";
import { Raffle, AddressInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { AddressZero } from "@ethersproject/constants";

import { useContractReader, useCustomContractLoader, useFetch } from "../hooks";

export default function Home({ address, localProvider, mainnetProvider, tx, readContracts, writeContracts }) {
  // Contract-level filtering confines us to static arrays,
  // so we have to filter out the Address-Zero entries here
  const completedRaffles = (useContractReader(readContracts, "RaffleFactory", "getCompletedRaffles") || []).filter(
    r => r !== AddressZero,
  );
  const activeRaffles = (useContractReader(readContracts, "RaffleFactory", "getActiveRaffles") || []).filter(
    r => r !== AddressZero,
  );

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
        <h2>Current Raffles:</h2>
        <Row>
          {activeRaffles.map(raffleAddress => (
              <Raffle key={raffleAddress} active={true} raffleAddress={raffleAddress} provider={localProvider} userAddress={address} />
          ))}
        </Row>
        <Divider />

        <h2> Past Raffles: </h2>
        <Row>
          {completedRaffles.map(raffleAddress => (
              <Raffle key={raffleAddress} active={false} raffleAddress={raffleAddress} provider={localProvider} userAddress={address} />
          ))}
        </Row>
      </div>
    </div>
  );
}