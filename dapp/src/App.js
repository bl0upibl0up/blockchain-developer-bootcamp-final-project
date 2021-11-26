import React from 'react';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import { AppContextProvider } from './AppContext';
import {Route, BrowserRouter} from  'react-router-dom';
import FestivalMarketToken from './abi/FestivalMarketToken.json';
import FestivalMarketPlace from './abi/FestivalMarketPlace.json';
import TransactionsLogic from './abi/TransactionsLogic.json';
import FestivalTicket from './abi/FestivalTicket.json';

import Home from './pages/Home';
import Festival from './pages/Festival';

import './App.css';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

const App = () => {
  
  return (
    <BrowserRouter>
    <AppContextProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <div>
          <Header />
          <Home/>
        </div>
      </Web3ReactProvider>
    </AppContextProvider>
    </BrowserRouter>
  );

};

export default App;