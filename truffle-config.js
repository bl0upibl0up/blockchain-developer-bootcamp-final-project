const dotenv = require("dotenv");
dotenv.config();


const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env.RINKEBY_MNEMONIC;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://rinkeby.infura.io/v3/${process.env.RINKEBY_INFURA_PROJECT_ID}`
        ),
      network_id: 4, 
      gas: 8000000,
      confirmations: 0,
      timeoutBlocks: 100000,
      skipDryRun: true,
      from: "0x08429eB7AcB6EaeA59127422DCb1c74A62C7Ee38",
    },
  },

  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: "0.8.0",
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "byzantium"
       }
    },
  },
};