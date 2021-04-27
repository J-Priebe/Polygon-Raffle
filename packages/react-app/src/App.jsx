import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu, Alert } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import {
  useGasPrice,
  useContractLoader,
  useBalance,
} from "./hooks";
import { Header, Account, Faucet } from "./components";
import { Transactor } from "./helpers";
import { formatEther, parseEther } from "@ethersproject/units";
import { Home, RaffleDetail, Admin } from "./views";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)

    // Deployment:
    yarn run generate will create a deployer account in packages/hardhat
    yarn run build && yarn run surge/s3/ipfs
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS["localhost"]; 

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

function App(props) {
  
  // TODO
  // one provider to rule them all. enough of this burner stuff.
  // if provider is null we do nothing.
  // and if there is no metamask, we'll create a local provider.
  // where the two are managed by a singular effect so we only have one at a time
  // const foo = useGradualProvider(window.ethereum);
  const [provider, setProvider] = useState();

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");

  const address = useUserAddress(provider);

  // You can warn the user if you would like them to be on a specific network
  let selectedChainId = provider?._network?.chainId;
  let localChainId = targetNetwork?.chainId;

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(provider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(provider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(provider, address);

  // // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const contracts = useContractLoader(provider);


  let networkDisplay = "";
  if (targetNetwork?.chainId && selectedChainId && targetNetwork.chainId != selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={
            <div>
              You have{" "}
              <b>
                {NETWORK(selectedChainId)?.name}({selectedChainId})
              </b>{" "}
              selected and you need to be on{" "}
              <b>
                {NETWORK(targetNetwork?.chainId)?.name} ({localChainId})
              </b>
              .
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    // Wrapper for transforming a web3 provider (like metamask)
    setProvider(new Web3Provider(provider));
  }, [setProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = "";
  const faucetAvailable = provider && provider.connection && targetNetwork.name == "localhost";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    provider &&
    provider._network &&
    provider._network.chainId == 31337 &&
    yourLocalBalance &&
    formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type={"primary"}
          onClick={() => {
            faucetTx({
              to: address,
              value: parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="/admin">
            <Link
              onClick={() => {
                setRoute("/admin");
              }}
              to="/admin"
            >
              Admin
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            <Home
              address={address}
              provider={provider}
              contracts={contracts}
            />
          </Route>
          <Route name="raffleDetail" path="/raffle/:address">
            <RaffleDetail 
              provider={provider} 
              tx={tx} 
              connectedAddress={address}
            />
          </Route>
          <Route name="admin" path="/admin">
            <Admin
              tx={tx}
              provider={provider}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          provider={provider}
          // price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={provider} 
                // price={price} 
                // ensProvider={provider} 
                />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

export default App;
