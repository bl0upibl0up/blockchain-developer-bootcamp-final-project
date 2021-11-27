# Festival Tickets Marketplace

This application implements a festival ticketing system running on a blockchain. It allows an organiser to create festivals and sell the tickets, represented as NFTs, on the app. It also features a marketplace to allow people to sell the tickets they bought. The ticket price cannot be higher than 110% of the previous price and the organiser can choose to receive a commission (up to 10%) on these transactions. An application is available online at this address to test the smart contracts: [`https://festivalmarketplace.on.fleek.co/`](https://festivalmarketplace.on.fleek.co/).

## Prerequisites

- Node.js >= 16.4
- Truffle and Ganache: `npm i -g truffle` & `npm i -g ganache-cli``
- Yarn

## Directories

- `contracts`: contains the solidity files
- `dapp`: contains the dapp (react)
- `migrations`: folder that holds the deploy scripts
- `test`: folder containing the test script

## Smart Contracts

The application uses four different smart contracts that inherits from the openzeppelin library:

1. `FestivalMarketToken.sol`: this is the ERC-20 token that represents the currency used to buy and sell tickets. Its name and symbol are `FestivalMarketToken`and `FMT`.
2. `FestivalTicket.sol`: this is the ERC-721 token that represents the festival tickets. The organiser of the festival chooses the price per ticket.
4. `TransactionsLogic.sol`: this is the contract that handles the transactions with the ERC-20 token. If a buyer has enough FMT, the ticket is on sale and the buyer is not the seller, the ticket is transferred to the new owner. The organiser's commission is handled in this contract. 
3. `FestivalMarketPlace.sol`: this contract allows the owner easily create festivals. Everytime the organiser creates a new festival, it creates an instance of the `TransactionsLogic`contract as well as an instance of `FestivalTicket`.

In the current implementation, only the `FestivalMarketPlace`and the `FestivalMarketToken`are unique. It means that there can only be one festival organiser and that the ERC-20 transactions are all linked to the deployed `FestivalMarketToken`.  

## How To Install  

We developed a web interface to demonstrate the different functionalities of the decentralized application. You will need [Metamask](https://metamask.io/) to test the app. The application has been tested on Mac OS.

Here are the different steps to run the app. 

1. Download or clone this repository.

2. Create a `.env` file containing `RINKEBY_MNEMONIC` & `RINKEBY_INFURA_PROJECT_ID`. They will be used to migrate the smart contracts.

3. Make sure to get some ETH from a rinkeby faucet to deploy your smart contracts [Faucet](https://faucets.chain.link/rinkeby).

4. In a terminal, from the the root directory, run:  

- `yarn`
- `truffle migrate --rinkeby` this will compile the smart contracts and deploy them on the rinkeby testnet.

5. In a terminal, from the dapp directory, run:

- `yarn`
- `yarn build:copy` this will copy the abi to the dapp folder
- `yarn start` this makes the app available in a web browser at the address [`http://localhost:3000`](http://localhost:3000).

**When reloading the page, the contracts are lost, the button `Fetch festival`reloads the smart contracts**
**When switching accounts in Metamask, the contracts are lost as well. Again, the button `Fetch festival`reloads the smart contracts**

## How to Run The Tests 

To run the test, in a terminal, type: `ganache-cli -p 7545` then, in a second terminal, type: `truffle test test/festivalMarketPlace.js` from the root directory of the project

## Application Flow


