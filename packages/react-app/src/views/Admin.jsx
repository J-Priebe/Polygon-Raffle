/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import {SAMPLE_JSON_URI} from "../constants";
import { Button,Input } from "antd";

import {
  useEventListener
} from "../hooks";

export default function ExampleUI({
  tx,
  writeContracts,
  provider
}) {

  const [dest, setDest] = useState('');

  const events = useEventListener(
    writeContracts,
    "SamplePrizeNFT",
    "sendingTestPrize",
    provider,
    1
  );

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
        <h2>Send Prize NFT to address</h2>
        uri: {SAMPLE_JSON_URI}
        <div style={{ margin: 8 }}>
          Address:
          <Input
            onChange={e => {
              setDest(e.target.value);
            }}
            value={dest}
          />

          <Button
            onClick={() => {
              console.log('sending prize to', dest, SAMPLE_JSON_URI);
              tx(writeContracts.SamplePrizeNFT.sendPrize(dest, SAMPLE_JSON_URI));
            }}
          >
            Send Prize
          </Button>
        </div>
      </div>
      <div>
        Events:
        {
          events?.map(evt => <div>EVENT: {JSON.stringify(evt)} </div> )
        }
      </div>
    </div>
  );
}
