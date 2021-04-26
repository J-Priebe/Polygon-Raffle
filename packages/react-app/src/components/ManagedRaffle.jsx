import React from "react";
import { Button, Input, Row, Col } from "antd";
import { AddressZero } from "@ethersproject/constants";
import { SAMPLE_JSON_URI, LINK_CONTRACT_ADDRESS } from "../constants";
import { parseEther, formatEther } from "@ethersproject/units";

import { useContractReader, useCustomContractLoader, useERC20ContractLoader } from "../hooks";

// Admin view of raffle for managers
export default function ManagedRaffle({ raffleAddress, provider, tx, contracts }) {
  const raffleClone = useCustomContractLoader(provider, "Raffle", raffleAddress);
  const winnerAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "winner");
  const prizeAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "prizeAddress");

  const winnerDeclared = winnerAddress && winnerAddress !== AddressZero;

  const prizeSet = prizeAddress && prizeAddress !== AddressZero;

  const linkContract = useERC20ContractLoader(provider, LINK_CONTRACT_ADDRESS);
  // technically not ether, but...
  const linkFeeAmount = parseEther("0.01");

  const linkBalance = useContractReader({ Link: linkContract }, "Link", "balanceOf", [raffleAddress]);

  return (
    <div>
      <Row>Address: {raffleAddress}</Row>
      <Row>{prizeSet ? `Prize: ${prizeAddress}` : "Prize has not been set for this raffle."}</Row>
      <Row>
        {winnerDeclared ? (
          `Winner: ${winnerAddress}`
        ) : prizeSet && linkBalance ? (
          <div>
            <Button
              onClick={() => {
                console.log('calling draw from', JSON.stringify(raffleClone.drawWinner))
                tx(raffleClone.drawWinner());
              }}
            >
              Draw Winner
            </Button>
          </div>
        ) : (
          "Set a prize and fund with LINK to call the draw."
        )}
      </Row>
      <Row>
        {winnerDeclared ? (
          ""
        ) : (
          <div>
            <Button
              onClick={() => {
                tx(linkContract.transfer(raffleAddress, linkFeeAmount));
              }}
            >
              Fund with LINK
            </Button>
            Sends a small amount of link to the raffle to cover cost of random number generation. Fee varies by network.
          </div>
        )}
      </Row>
      <Row>
        {prizeSet ? (
          ""
        ) : (
          <div>
            <Button
              onClick={() => {
                console.log("sending prize to", raffleAddress, SAMPLE_JSON_URI);
                tx(contracts.SamplePrizeNFT.sendPrize(raffleAddress, SAMPLE_JSON_URI));
              }}
            >
              Send Dummy NFT Prize
            </Button>
          </div>
        )}
      </Row>
      <Row>Link Balance: {linkBalance ? formatEther(linkBalance) : "--"}</Row>
    </div>
  );
}