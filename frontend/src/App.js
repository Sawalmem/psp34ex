import React, {useState,useEffect, useCallback} from 'react'; 
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import {
  web3Accounts, 
  web3Enable, 
  web3AccountsSubscribe, 
  web3FromSource
} from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import psp34ABI from "./contracts/psp34ex.json";
import {PSP34EX_ADDRESS,RPC_URL} from "./assets/constants";


import Toolbar from './components/Toolbar';
import Home from './containers/Home';
import Mint from './containers/Mint.js';
import Dashboard from './containers/Dashboard.js';


function App() {
  const [allAccounts,setAllAccounts] = useState();
  const [activeAccount, setActiveAccount] = useState(null);
  const [nftContract,setNftContract] = useState(null);
  const [signer,setSigner] = useState(null);

  //console.log(allAccounts);
  //console.log("active: ",activeAccount);

  const walletInit = useCallback ( async () => {
    const allInjected = await web3Enable('psp34ex');

    if (allInjected.length === 0) {
        console.log("No extension installed");
        return;
    }
    const temp = await web3Accounts();
    setAllAccounts(temp);

    let unsubscribe; 

    unsubscribe = await web3AccountsSubscribe(( allAccounts ) => { 
        allAccounts.map(( account ) => {
            console.log("Subscribe : ",account.address);
        })
     });

     unsubscribe && unsubscribe();
  });

  useEffect(() => {
    walletInit();
  },[])

  useEffect(() => {
    if (allAccounts && !activeAccount) {
      setActiveAccount(allAccounts[0]);
    }
  },[allAccounts])

  const setUp = async () => {
    if (activeAccount) {
      const wsProvider = new WsProvider(RPC_URL);
      const api = await ApiPromise.create({ provider: wsProvider });
      const contract2 = new ContractPromise(api, psp34ABI, PSP34EX_ADDRESS);
      setNftContract(contract2);
      console.log("activeAccount ::::",activeAccount);
      const accountSigner = await web3FromSource(activeAccount.meta.source).then(
        (res) => res.signer
      );
      setSigner(accountSigner);
    }
  }

  useEffect(() => {
    setUp();
  },[activeAccount])

  const onHandleSelect = (e) => {
    e.preventDefault();
    console.log("ETAR",e.target.value);
    setActiveAccount(allAccounts[e.target.value]);
  }

  return (
    <BrowserRouter>
      <Toolbar />
      <Routes>
        <Route path="/" element={<Home 
        activeAccount={activeAccount} 
        allAccounts={allAccounts}
        onHandleSelect={onHandleSelect}
        />}
         />
        <Route path="/mint" element={<Mint 
        activeAccount={activeAccount} 
        signer={signer}
        nftContract={nftContract}
        />} /> 
        <Route path="/dashboard" element={<Dashboard 
        activeAccount={activeAccount} 
        signer={signer}
        nftContract={nftContract}
        />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
