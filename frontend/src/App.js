import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  web3Accounts,
  web3Enable,
  web3AccountsSubscribe,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import tokenABI from "./contracts/token.json";
import marketplaceABI from "./contracts/marketplace.json";
import {
  TOKEN_ADDRESS_ROCOCO,
  MARKETPLACE_ADDRESS_ROCOCO,
  RPC_URL_ROCOCO,
} from "./assets/constants";

import Toolbar from "./components/Toolbar";
import Home from "./containers/Home";
import Mint from "./containers/Mint.js";
import Dashboard from "./containers/Dashboard.js";
import List from "./containers/List.js";

function App() {
  const [allAccounts, setAllAccounts] = useState();
  const [activeAccount, setActiveAccount] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [signer, setSigner] = useState(null);

  //console.log(allAccounts);

  useEffect(() => {
    console.log("contract token: ", tokenContract);
    console.log("contract amrketplace: ", marketplaceContract);
  }, [tokenContract, marketplaceContract]);

  const walletInit = useCallback(async () => {
    const allInjected = await web3Enable("token");

    if (allInjected.length === 0) {
      console.log("No extension installed");
      return;
    }
    const temp = await web3Accounts();
    setAllAccounts(temp);

    let unsubscribe;

    unsubscribe = await web3AccountsSubscribe((allAccounts) => {
      allAccounts.map((account) => {
        console.log("Subscribe : ", account.address);
      });
    });

    unsubscribe && unsubscribe();
  });

  useEffect(() => {
    walletInit();
  }, []);

  useEffect(() => {
    if (allAccounts && !activeAccount) {
      setActiveAccount(allAccounts[0]);
    }
  }, [allAccounts]);

  const setUp = async () => {
    if (activeAccount) {
      const wsProvider = new WsProvider(RPC_URL_ROCOCO);
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;
      const tokenContract = new ContractPromise(
        api,
        tokenABI,
        TOKEN_ADDRESS_ROCOCO
      );
      setTokenContract(tokenContract);
      const marketplaceContract = new ContractPromise(
        api,
        marketplaceABI,
        MARKETPLACE_ADDRESS_ROCOCO
      );
      setMarketplaceContract(marketplaceContract);
      console.log("activeAccount ::::", activeAccount);
      const accountSigner = await web3FromSource(
        activeAccount.meta.source
      ).then((res) => res.signer);
      setSigner(accountSigner);
    }
  };

  useEffect(() => {
    setUp();
  }, [activeAccount]);

  const onHandleSelect = (e) => {
    e.preventDefault();
    console.log("ETAR", e.target.value);
    setActiveAccount(allAccounts[e.target.value]);
  };

  return (
    <BrowserRouter>
      <Toolbar />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              activeAccount={activeAccount}
              allAccounts={allAccounts}
              onHandleSelect={onHandleSelect}
            />
          }
        />
        <Route
          path="/mint"
          element={
            <Mint
              activeAccount={activeAccount}
              signer={signer}
              nftContract={tokenContract}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              activeAccount={activeAccount}
              signer={signer}
              nftContract={marketplaceContract}
            />
          }
        />
        <Route
          path="/list"
          element={
            <List
              activeAccount={activeAccount}
              signer={signer}
              nftContract={tokenContract}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
