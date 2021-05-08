import React from "react";
import { useCustomContractLoader, useContractReader, useFetch } from "../hooks";
import { Link } from "react-router-dom";
import { Button, Row, Col, Image } from "antd";

import { formatEther } from "@ethersproject/units";

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

  const winnerAddress = useContractReader({ Raffle: raffleClone }, "Raffle", "winner");
  const winner = winnerAddress == userAddress? '🎉You!🎉' : winnerAddress
  return (
    <Col span={8}>
      <Row>
        <Col>
          <Image src={prizeData?.image} width={250} height={250} />
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
            <h4>&#x2764;{benefactorName}</h4>
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
