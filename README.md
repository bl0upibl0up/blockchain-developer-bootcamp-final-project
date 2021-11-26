# Festival Tickets Marketplace

This application implements a festival ticketing system running on a blockchain. It allows an organiser create festivals and sell the tickets, represented as NFTs, on the app. It also features a marketplace to allow people sell the tickets they bought. The ticket price cannot be higher than 110% of the previous price and the organiser can choose to receive a commission (up to 10%) on these transactions.

## Smart Contracts

The application uses four different smart contracts that inherits from the openzeppelin library:

1. `FestivalMarketToken.sol`: this is the ERC-20 token that represents the currency used to buy and sell tickets. Its name and symbol are `FestivalMarketToken`and `FMT`.
2. `FestivalTicket.sol`: this is the ERC-721 token that represents the festival tickets. The organiser of the festival chooses the price per ticket.
4. `TransactionsLogic.sol`: this is the contract that handles the transactions with the ERC-20 token. If a buyer has enough FMT, the ticket is on sale and the buyer is not the seller, the ticket is transferred to the new owner. The organiser's commission is handled in this contract. 
3. `FestivalMarketPlace.sol`: this contract allows the owner easily create festivals. Everytime the organiser creates a new festival, it creates an instance of the `TransactionsLogic`contract as well as an instance of `FestivalTicket`.

In the current implementation, only the `FestivalMarketPlace`and the `FestivalMarketToken`are unique. It means that there can only be one festival organiser and that the ERC-20 transactions are all linked to the deployed `FestivalMarketToken`.  

## How To Use 

We developed a web interface to demonstrate the different functionalities of the decentralized application. You will need [Docker](https://www.docker.com/get-started) and Docker Compose as well as [Metamask](https://metamask.io/) to test the app. The application has been tested on Mac OS, Ubuntu and Windows 10.

Here are the different steps to run the app. 

1. Download or clone this repository.

2. In a terminal, from the the root directory `festivalTickets`, run:  
`docker-compose up --build`  
This creates a local blockchain on your computer using `ganache-cli` and deploys the smart contracts on this blockchain with `truffle`. As explained in the previous section, only the `FestivalMarketToken`and the `FestivalMarketPlace`contracts are deployed at first. Instances of the other contracts are created everytime you create a new festival on the market place. If everything worked as intended, you should see lines similar to those of the following image in your terminal: 
![](images/ganache_docker.png)

### Metamask configuration 

1. In Metamask, if you are already logged on your own account, you can either lock it and import the accounts created by `ganache-cli` using the mnemonic or write down the first four or five private addresses shown in the terminal. If you choose to import using the mnemonic, make sure that you know the one of your own account to restore it afterwards. 
<img src="images/import_account.png" width="400"/> 

Importing with the mnemonic should automatically import all the accounts created by `ganache-cli`. To easily use the app in the following steps, rename the account corresponding to the first account you see in the terminal as the `Organiser` and subsequent accounts as `Customer 1`, `Customer 2`, etc... In the provided example, the `Organiser` account has the public address `0x966469e62f32E034Dd7b2028D7Ab56A77F732bb2`. This is an important step as the `Organiser`account is the only one that can create festivals. To rename an account, click on the three dots next to its name, click on account details, click on the pen next to its name and write the new name in the box. 

2. To connect Metamask to the local blockchain, click on the network drop down list at the top of Metamask, between the fox and the account logo and then, click on `Custom RPC` and fill the different elements as shown in the following picture (127.0.0.1 instead of 0.0.0.0 on Windows): 
<img src="images/rpc.png" width="400"/>

Metamask should be able to connect to your local blockchain. 

### Running The Decentralized App

1. In a different terminal, from the directory `dapp`, run:  
`docker-compose up --build`  

This makes the app available in a web browser at the address: [`http://0.0.0.0:8080`](http://0.0.0.0:8080) (or [`http://127.0.0.1:8080`](http://127.0.0.1:8080) on windows).

2. In your browser, go to [`http://0.0.0.0:8080`](http://0.0.0.0:8080). Metamask should pop up to tell you that the website wants to connect to your account.
<img src="images/metamask_connection.png" width="800"/>

3. If everything succeeded, you should see the following website: 
<img src="images/festival.png" width="800"/>

In case you are trying to import the `Organiser`account after this step in Metamask without using the mnemonic but rather using the private key, you might need to reconnect to the `ganache-cli` RPC and then, make sure that the account is connected to the website. It should have a balance of 99,xx ETH.  

4. At the bottom of the page, in the `Smart Contracts Logs`, you should see the address of the `Festival Market Token` contract. Add this token to the `Organiser` account and send some `FMT` to the `Customers`. 
<img src="images/add_fmt.png" width="800"/>

### Create a Festival

To create a festival, make sure that the `Organiser` account is selected in Metamask, then, give the festival a name, a symbol, choose the ticket price as well as the organiser commission. The price should be a positive number and the name and symbols should be strings. 
<img src="images/create_festival.png" width="800"/>

Metamask should show you a transaction, click on confirm. You can check the status of the transaction in `Smart Contracts Logs`.
If the account is not the `Organiser` or if you try to create a festival with the same name as an existing festival, the smart contract will throw an error. 

### Mint The tickets 

Select the festival you created in the dropdown list and click on `Mint Tickets`. Metamask should show you 40 transactions and it might also say "Gas limit must be at least 21000". If this is the case, wait until the message disappears and accept the 40 transactions. Creating the 1000 tickets with a single transaction is currently not possible with this implementation. 
<img src="images/mint_tickets.png" width="800"/>

If the account is not the `Organiser`, the transaction does not succeed. If the tickets have already been minted, an alert pops up to let you know that you cannot mint anymore. 

### Buy From Organiser

In Metamask, switch to a `Customer` account. Then, select the festival you just minted the tickets for and click on `Look For Tickets`. This checks if any tickets are available to buy from the `Organiser`. An alert pops up to let you know if tickets are available. If the organiser has tickets to sell, you can select the one you want to buy and click on `Buy Ticket`. Metamask should show you two transactions. The first one gives the authorization to the `TransactionsLogic`contract to spend the `FMT` and the second allows you to buy the ticket. Do not change the festival after the ticket id selection or you might end up buying a ticket for a different event. The organiser cannot buy its own tickets.

<img src="images/buy_ticket_from_organiser.png" width="800"/>

### Sell On Secondary Market

From the `Customer` account, select the festival then, click on `Look For Tickets`. If the account owns festival tickets, it is allowed to sell them on the marketplace. Select the ticket you want to sell, write the selling price and click on `Set On Sale`. Accept the transaction in Metamask. You can put the same ticket on sale again with a different price. If the price is more than 110% higher than the price the ticket was bought at, the transaction will fail.

<img src="images/set_on_sale.png" width="800"/>

### Buy On Secondary Market

From a different `Customer` account, select the festival then, click on `Look For Tickets`. If tickets are available on the secondary market for the selected festival, an alert pops up to let you know that tickets were found. Select the ticket id, an alert pops up to tell you the price of the ticket. Click on `Buy Ticket`. Accept the transaction in Metamask. The `Customer` can now sell the ticket on the secondary market. The `Organiser` cannot buy on the secondary market. 

<img src="images/buy_ticket_from_secondary_market.png" width="800"/>

### Ticket Owners Per Festisval

<img src="images/get_owners.png" width="800"/>

Select the festival then, click on `Get Owners`. The list of `Customers` who owns tickets appears in the `Smart Contract Log` section. 
