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
      network_id: 4, // Ropsten's id
      gas: 8000000, // Ropsten has a lower block limit than mainnet
      confirmations: 0, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 100000, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
      from: "0x3967c793618Cd6Db52123f3fA5b6203C2b554BEC",
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