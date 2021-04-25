/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, Divider, Input, Row, Col, Image } from "antd";
import { Raffle, AddressInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { useContractReader, useCustomContractLoader, useFetch } from "../hooks";


export default function Home({
  address,
  localProvider,
  mainnetProvider,
  tx,
  readContracts,
  writeContracts,
}) {
  const raffles = useContractReader(readContracts, "RaffleFactory", "getActiveRaffles");
  const allRaffles = useContractReader(readContracts, "RaffleFactory", "getAllRaffles");
  return (
    <div>
      all of them: {allRaffles}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
        <h2>Current Raffles:</h2>
        <Row>
        {(raffles || []).map(
          raffleAddress => <Raffle raffleAddress={raffleAddress} provider={localProvider} userAddress={address} />
        )

          
        }
        </Row>
        <Divider />

        <h2> Past Raffles: </h2>
        soon...

      </div>
    </div>
  );
}
