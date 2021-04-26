import React  from "react";
import { Button, Input, Row, Col } from "antd";
import { AddressZero } from "@ethersproject/constants";

import { useContractReader, useCustomContractLoader } from "../hooks";

// Admin view of raffle for managers
export default function ManagedRaffle({ raffleAddress, provider, tx }) {
  const raffleClone = useCustomContractLoader(provider, "Raffle", raffleAddress);
  const winnerAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "winner");
  const prizeAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "prizeAddress");

  const winnerDeclared = winnerAddress && winnerAddress !== AddressZero;

  const prizeSet = prizeAddress && prizeAddress !== AddressZero;
  return (
    <div key={raffleAddress}>
      <Row>Address: {raffleAddress}</Row>
      <Row>{prizeSet ? `Prize: ${prizeAddress}` : "Prize has not been set for this raffle."}</Row>
      <Row>
        {winnerDeclared ? (
          `Winner: ${winnerAddress}`
        ) : (
          <div>
            <Button
              onClick={() => {
                tx(raffleClone.drawWinner());
              }}
            >
              Draw Winner
            </Button>
          </div>
        )}
      </Row>
      <Row>
        {winnerDeclared ? (
          `Winner: ${winnerAddress}`
        ) : (
          <div>
            <Button
              onClick={() => {
                tx(raffleClone.drawWinner());
              }}
            >
              Fund with LINK
            </Button>
          </div>
        )}
      </Row>
      <Row>
        {winnerDeclared ? (
          `Winner: ${winnerAddress}`
        ) : (
          <div>
            <Button
              onClick={() => {
                tx(raffleClone.drawWinner());
              }}
            >
              Send Dummy NFT Prize
            </Button>
          </div>
        )}
      </Row>
    </div>
  );
}
