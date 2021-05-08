/* eslint-disable jsx-a11y/accessible-emoji */

import React from "react";
import { Divider, Row, Col, Image } from "antd";
import { Raffle, RaffleDetail } from "../components";
import { AddressZero } from "@ethersproject/constants";

import { useContractReader, useCustomContractLoader, useFetch } from "../hooks";

// Need to iterate every raffle and find tickets owned...
// OR we can centralize the minter on the factory?
// but if we did that we would need to keep track of which tickets
// were for which raffle, and couldn't use simple mod + ticket index
// for drawing
// once again this would be made easier via the graph

// for now, we iterate and get tickets owned for every raffle
// and for each one show the ticket picture, numbers, and point to the
// raffle (address, or prize/donor/benefactor? hmm. that's tough without
// a detail page. maybe we bring it back. yeah, we might as well.)

/*
How do we actually do this though.. you can get the balances but not the individual
tickets...?

unless we iterate over the ticketMinters and call ownerOf on each of them

ALright, we have an externalyl callable function on the minter
which gives us an array of ticket ids. so we can look at every raffle,
get their minter address, and then get their tickets.
*/

function RewardsSummary({ raffleAddress, readProvider, connectedAddress }) {
  const raffleClone = useCustomContractLoader(readProvider, "Raffle", raffleAddress);
  const ownedByYou = useContractReader({ Raffle: raffleClone }, "Raffle", "getTicketBalance", [connectedAddress]);
  const ticketMinterAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketMinter");

  const minterContract = useCustomContractLoader(readProvider, "RaffleTicket", ticketMinterAddress);
  // array of tickets
  const ownedTickets = useContractReader({ RaffleTicket: minterContract }, "RaffleTicket", "tokensOfOwner", [
    connectedAddress,
  ]);
  const winner = useContractReader({ Raffle: raffleClone }, "Raffle", "winner");
  const prizeData = useFetch(useContractReader({ Raffle: raffleClone }, "Raffle", "getPrizeURI"));
  const ticketData = useFetch(useContractReader({ Raffle: raffleClone }, "Raffle", "ticketURI"));

  const ticketsResult = (ownedTickets || []).map(ticketObj => ticketObj.toString()).join(", ");
  const prizeResult = winner && winner == connectedAddress ? prizeData : undefined;

  if (!(ticketsResult || prizeResult)) {
    return null;
  }

  return (
    <Row justify="center" align="middle"><Col>
      <Row>
        <Col>
          <h3>{raffleAddress}</h3>
        </Col>
      </Row>
      {
        // TODO view on opensea
        ticketsResult ? (
          <Row>
            <Col>
              <Image src={ticketData?.image} width={150} height={150} />
              My Tickets: {ticketsResult}
            </Col>
          </Row>
        ) : null
      }
      {prizeResult ? (
        <Row>
          <Col>
            <Image src={prizeData?.image} width={150} height={150} />
            🎉Grand Prize Winner!🎉
          </Col>
        </Row>
      ) : null}
      <Divider />
    </Col></Row>
  );
}

export default function Tickets({ readProvider, contracts, connectedAddress }) {
  // we can also show the prizes you won here...

  const allRaffles = useContractReader(contracts, "RaffleFactory", "getAllRaffles") || [];

  return (
    <div>
      {allRaffles.map(raffleAddress => {
        return (
          <RewardsSummary
            key={raffleAddress}
            raffleAddress={raffleAddress}
            readProvider={readProvider}
            connectedAddress={connectedAddress}
          />
        );
      })}
    </div>
  );
}
