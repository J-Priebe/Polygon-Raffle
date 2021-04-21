/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, Balance, Raffle } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";


export default function ExampleUI(
  {
    raffles, address, mainnetProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts 
  }) {

  const [numTickets, setNumTickets] = useState(100);
  const [ticketPrice, setTicketPrice] = useState(1000000);
  const [benefactorAddress, setBenfactorAddress] = useState();

  return (
    <div>
      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>
        <h2>Example UI:</h2>

        <h4>All Raffles:</h4>

        {
          (raffles || []).map(raffle => 
            <div 
              key={raffle}
            > 
                <Raffle raffleAddress={raffle}  provider={localProvider}/>
            </div>)
        }

        <Divider/>

        
        <div style={{margin:8}}>
          Num Tickets :
          <Input onChange={(e)=>{setNumTickets(e.target.value)}} value={numTickets}/>
          Ticket Price (wei): 
          <Input onChange={(e)=>{setTicketPrice(e.target.value)}} value={ticketPrice}/>
          Benefactor Address:
          <Input onChange={(e)=>{setBenfactorAddress(e.target.value)}} value={benefactorAddress} />
          <Button onClick={()=>{
            tx( writeContracts.RaffleFactory.createRaffle(numTickets, ticketPrice, benefactorAddress) )
          }}>Launch Raffle</Button>
        </div>


        <Divider />

        Your Address:
        <Address
            address={address}
            ensProvider={mainnetProvider}
            fontSize={16}
        />


        {  /* use formatEther to display a BigNumber: */ }
        <h2>Your Balance: {yourLocalBalance?formatEther(yourLocalBalance):"..."}</h2>

        <div>OR</div>

        <Balance
          address={address}
          provider={localProvider}
          price={price}
        />

        {  /* use formatEther to display a BigNumber: */ }
        <h2>Your Balance: {yourLocalBalance?formatEther(yourLocalBalance):"..."}</h2>

        <Divider/>



        Your Contract Address:
        <Address
            address={readContracts?readContracts.RaffleFactory.address:readContracts}
            ensProvider={mainnetProvider}
            fontSize={16}
        />

        <Divider />

        <div style={{margin:8}}>
          <Button onClick={()=>{
            /*
              you can also just craft a transaction and send it to the tx() transactor
              here we are sending value straight to the contract's address:
            */
            tx({
              to: writeContracts.RaffleFactory.address,
              value: parseEther("0.001")
            });
            /* this should throw an error about "no fallback nor receive function" until you add it */
          }}>Send Value</Button>
        </div>
      </div>

   
    </div>
  );
}
