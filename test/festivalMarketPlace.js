const assert = require("assert");

var FestivalMarketPlace = artifacts.require('FestivalMarketPlace');
var FestivalMarketToken = artifacts.require('FestivalMarketToken');
var TransactionsLogic = artifacts.require('TransactionsLogic');
var FestivalTicket = artifacts.require('FestivalTicket');

contract("FestivalMarketPlace", accounts => {

    const owner = accounts[0];
    const customerOne = accounts[1];
    const customerTwo = accounts[2];

    var festivalName;
    var festivalSymbol;
    var totalSupply;
    var ticketPrice;
    var organiserCommission;

    beforeEach(async () => {
        festivalName = 'testFest';
        festivalSymbol = 'tF';
        totalSupply = 10;
        ticketPrice = web3.utils.toWei('1', 'ether');
        organiserCommission = 2;
        festivalMarketPlace = await FestivalMarketPlace.new({from: owner});
        festivalMarketToken = await FestivalMarketToken.new({from: owner});
    })
    
    it('should be able to create a festival', async () => {

        await festivalMarketPlace.createFestival(festivalName, festivalSymbol, totalSupply, ticketPrice, organiserCommission,
            owner, festivalMarketToken.address, {from: owner}); 
        
        var festivalDetails = await festivalMarketPlace.getFestivalsOnMarketPlace();
        assert(festivalDetails[0][0] == festivalName);
        assert(festivalDetails[0][1] == festivalSymbol);
        assert(festivalDetails[0][3] == ticketPrice);
    });

    it('should be able to mint ticket', async () => {
        
        var tx = await festivalMarketPlace.createFestival(festivalName, festivalSymbol, totalSupply, ticketPrice, organiserCommission,
            owner, festivalMarketToken.address, {from: owner});

        var txLogicAddress = tx['logs'][0].args['1'];
        txLogicInstance = await TransactionsLogic.at(txLogicAddress);

        var ticketsAddress = await txLogicInstance.getTicketAddress();
        festivalTicketInstance = await FestivalTicket.at(ticketsAddress);
        await festivalTicketInstance.batchMint(10, txLogicAddress);
        //var balance = await festivalTicketInstance.balanceOf(txLogicAddress);
        //assert(balance == 10);
    })

    it('customer should be able to buy from the owner', async () => {
        var tx = await festivalMarketPlace.createFestival(festivalName, festivalSymbol, totalSupply, ticketPrice, organiserCommission,
            owner, festivalMarketToken.address, {from: owner});

        var txLogicAddress = tx['logs'][0].args['1'];
        txLogicInstance = await TransactionsLogic.at(txLogicAddress);

        var ticketsAddress = await txLogicInstance.getTicketAddress();
        festivalTicketInstance = await FestivalTicket.at(ticketsAddress);
        await festivalTicketInstance.batchMint(10, txLogicAddress);

        await festivalMarketToken.faucet(customerOne, web3.utils.toWei('100', 'ether'));
        await festivalMarketToken.approve(txLogicAddress, ticketPrice, {from: customerOne});
        
        await txLogicInstance.purchaseOnFirstMarket(0, {from: customerOne});

        var newOwner = await festivalTicketInstance.ownerOf(0);

        assert(newOwner == customerOne);
    })
    
    it('customer should be able to sell on the secondary market', async () => {
        var tx = await festivalMarketPlace.createFestival(festivalName, festivalSymbol, totalSupply, ticketPrice, organiserCommission,
            owner, festivalMarketToken.address, {from: owner});

        var txLogicAddress = tx['logs'][0].args['1'];
        txLogicInstance = await TransactionsLogic.at(txLogicAddress);

        var ticketsAddress = await txLogicInstance.getTicketAddress();
        festivalTicketInstance = await FestivalTicket.at(ticketsAddress);
        await festivalTicketInstance.batchMint(10, txLogicAddress);

        await festivalMarketToken.faucet(customerOne, web3.utils.toWei('100', 'ether'));
        await festivalMarketToken.approve(txLogicAddress, ticketPrice, {from: customerOne});
        
        await txLogicInstance.purchaseOnFirstMarket(0, {from: customerOne});

        var newOwner = await festivalTicketInstance.ownerOf(0);

        assert(newOwner == customerOne);
        await festivalTicketInstance.setTicketOnSale(0, web3.utils.toWei('2', 'ether'), txLogicAddress, {from: customerOne});
        var ticketInfo = await festivalTicketInstance.getTicketInfo(0);
        assert(ticketInfo[2] == true);
    })

    it('customer should be able to buy from the secondary market', async () => {
        var tx = await festivalMarketPlace.createFestival(festivalName, festivalSymbol, totalSupply, ticketPrice, organiserCommission,
            owner, festivalMarketToken.address, {from: owner});

        var txLogicAddress = tx['logs'][0].args['1'];
        txLogicInstance = await TransactionsLogic.at(txLogicAddress);

        var ticketsAddress = await txLogicInstance.getTicketAddress();
        festivalTicketInstance = await FestivalTicket.at(ticketsAddress);
        await festivalTicketInstance.batchMint(10, txLogicAddress);

        await festivalMarketToken.faucet(customerOne, web3.utils.toWei('100', 'ether'));
        await festivalMarketToken.approve(txLogicAddress, ticketPrice, {from: customerOne});
        
        await txLogicInstance.purchaseOnFirstMarket(0, {from: customerOne});

        var newOwner = await festivalTicketInstance.ownerOf(0);

        assert(newOwner == customerOne);
        await festivalTicketInstance.setTicketOnSale(0, web3.utils.toWei('2', 'ether'), txLogicAddress, {from: customerOne});
        var ticketInfo = await festivalTicketInstance.getTicketInfo(0);
        var newPrice = ticketInfo[1];

        await festivalMarketToken.faucet(customerTwo, web3.utils.toWei('100', 'ether'));
        await festivalMarketToken.approve(txLogicAddress, web3.utils.toWei(newPrice, 'ether'), {from: customerTwo});
        await txLogicInstance.purchaseOnSecondaryMarket(0, {from: customerTwo});
        newOwner = await festivalTicketInstance.ownerOf(0);
        assert(newOwner == customerTwo);
    })

})