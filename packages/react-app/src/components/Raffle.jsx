import React, { useState } from "react";
import {  useLoadContractByAddress, useContractReader} from "../hooks";
// this feels very Angular-like.. would like to get flux/redux in here
// to manage the provider instead of passing it everywhere
export default function Raffle({raffleAddress, provider}) {

  const raffleClone = useLoadContractByAddress('Raffle', raffleAddress, provider)

  // this is a bit silly with our singular contract but eh works for now
  const ticketPrice = useContractReader(
    {"Raffle": raffleClone},
    "Raffle", 
    "ticketPrice"
  )
 
  return (
    <div>
      Address: {raffleAddress.slice(0, 8)}***, 
      Ticket price: {ticketPrice? ticketPrice.toNumber() : ''} 
    </div>
  );

}
  