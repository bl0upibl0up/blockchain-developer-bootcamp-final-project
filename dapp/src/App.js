import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
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
        </div>
      </Web3ReactProvider>
    </AppContextProvider>
  );
};

export default App;