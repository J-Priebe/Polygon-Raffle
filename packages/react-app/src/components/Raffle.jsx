import React from "react";
import { useCustomContractLoader, useContractReader, useFetch } from "../hooks";
import { Link } from "react-router-dom";
import { Button, Row, Col, Image } from "antd";

import { formatEther } from "@ethersproject/units";

// this feels very Angular-like.. would like to get flux/redux in here
// to manage the provider instead of passing it everywhere
export default function Raffle({ raffleAddress, userAddress, provider, active }) {
  const raffleClone = useCustomContractLoader(provider, "Raffle", raffleAddress);

  // TODO bulk reader?
  const ticketPrice = useContractReader({ Raffle: raffleClone }, "Raffle", "ticketPrice");
  const numTicketsSold = useContractReader({ Raffle: raffleClone }, "Raffle", "numTicketsSold");
  const numInitialTickets = useContractReader({ Raffle: raffleClone }, "Raffle", "numInitialTickets");

  const numTicketsOwnedByUser = useContractReader({ Raffle: raffleClone }, "Raffle", "getTicketBalance", [userAddress]);

  const benefactorName = useContractReader({ Raffle: raffleClone }, "Raffle", "benefactorName");

  const prizeData = useFetch(useContractReader({ Raffle: raffleClone }, "Raffle", "getPrizeURI"));

  const donorAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "donor");
  const prizeTitle = prizeData?.name || (donorAddress ? donorAddress.slice(0, 8) + "***" : "Unnamed");

  const winner = useContractReader({ Raffle: raffleClone }, "Raffle", "winner");

  return (
    <Col span={8}>
      <Row>
        <Col>
          <Image src={prizeData?.image} />
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>{prizeTitle}</h2>
        </Col>
      </Row>
      {benefactorName ? (
        <Row>
          <Col>
            <h4>{benefactorName}</h4>
          </Col>
        </Row>
      ) : (
        ""
      )}
      <Row>
        <Col>
          <h4>
            {numTicketsSold ? numTicketsSold.toString() : "--"}/
            {numInitialTickets ? numInitialTickets.toString() : "--"} tickets sold{" "}
            {numTicketsOwnedByUser && numTicketsOwnedByUser > 0 ? `(${numTicketsOwnedByUser} owned)` : ""}
          </h4>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>{ticketPrice ? formatEther(ticketPrice) : "--"} ETH</h4>
        </Col>
        {
          // quick hack to reuse component for won/lost raffles.
          // might make separate components if they diverge
          active ? (
            <Col>
              <Link
                to={{
                  pathname: `/raffle/${raffleAddress}`,
                }}
              >
                <Button>Buy</Button>
              </Link>
            </Col>
          ) : (
            ""
          )
        }
      </Row>
      <Row>{active ? "" : <Col>Winner: {winner}</Col>}</Row>
    </Col>
  );
}
