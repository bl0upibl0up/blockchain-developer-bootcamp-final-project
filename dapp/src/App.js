import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Switch, Route} from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import { AppContextProvider } from './AppContext';

import './App.css';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

const App = () => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', () => window.location.reload());
  }

  return (
    <AppContextProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <div>
          <Header />
          <main class="container">
            <h2> Create Festival </h2>
            <div class="row top">
              <label>Festival name</label><input type="text" id="festival-name"></input>
              <label>Festival Symbol</label><input type="text" id="festival-name"></input>
              <label>Ticket price</label><input type="text" id="ticket-price"></input>
              <select id="organiser-commission"><option value="">Organiser commission...</option></select>
              <button class="btn top-5" id="create-festival" onclick="App.createFestival()">Create Festival</button>
            </div>
          </main>
        </div>
      </Web3ReactProvider>
    </AppContextProvider>
  );
};

export default App;