/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from "@ethersproject/contracts";
import { useState, useEffect } from "react";

/*
  Like ContractLoader, but for a single contract where you specify
  the address instead of using the default dynamically generated address
  deployed by the hardhat package.

  Reason for doing this is clones. The contract you deployed might just be
  the interface, and you actually want to work with clones of that same contract
  which have the same ABI but are deployed and initialized by a factory 
  at a different address.

  I think this is basically ExternalContractLoader...
*/

const loadContract = (contractName, contractAddress, signer) => {
  const newContract = new Contract(
    contractAddress,
    require(`../contracts/${contractName}.abi.js`),
    signer,
  );
  try {
    newContract.bytecode = require(`../contracts/${contractName}.bytecode.js`);
  } catch (e) {
    console.log(e);
  }
  return newContract;
};

export default function useLoadContractByAddress(contractName, contractAddress, providerOrSigner) {
  const [contract, setContract] = useState();
  useEffect(() => {
    async function _loadContract() {
      if (typeof providerOrSigner !== "undefined") {
        try {
          // we need to check to see if this providerOrSigner has a signer or not
          let signer;
          let accounts;
          if (providerOrSigner && typeof providerOrSigner.listAccounts === "function") {
            accounts = await providerOrSigner.listAccounts();
          }

          if (accounts && accounts.length > 0) {
            signer = providerOrSigner.getSigner();
          } else {
            signer = providerOrSigner;
          }

          setContract(
              loadContract(contractName, contractAddress, signer)
          )

        } catch (e) {
          console.log("ERROR LOADING CONTRACT!!", e);
        }
      }
    }
    _loadContract();
  }, [providerOrSigner]);
  return contract;
}
