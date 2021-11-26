    import styled from 'styled-components';
    import { Button, Container, Form, ListGroup } from 'react-bootstrap';
    import { useWeb3React } from '@web3-react/core';
    import Text from '../../components/Text';
    import { colors } from '../../theme';
    import FestivalMarketPlace from '../../abi/FestivalMarketPlace.json';
    import FestivalMarketToken from '../../abi/FestivalMarketToken.json';
    import TransactionLogic from '../../abi/TransactionsLogic.json';
    import FestivalTicket from '../../abi/FestivalTicket.json';
    import Web3 from 'web3';

    const FestButton = styled(Button).attrs({ variant: 'outline-primary'})`
        color: ${colors.darkBlue}$;
        border-color: ${colors.darkBlue}$;
        margin-top: 20px;
    `;

    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for(i = L; i >= 0; i--) {
        selectElement.remove(i);
        }
    }
    async function fetchContracts(w3, chId, scLog, mintBox, organiserBox, sellerBox, buyerBox, OwnerBox){
        const accounts = await w3.eth.getAccounts();
        var festMarketPlace = await new w3.eth.Contract(FestivalMarketPlace.abi, FestivalMarketPlace.networks[chId].address);
        var marketToken = await new w3.eth.Contract(FestivalMarketToken.abi, FestivalMarketToken.networks[chId].address);
        var festDetails = await festMarketPlace.methods.getFestivalsOnMarketPlace().call({from: accounts[0]});
        var txLogic = {}
        var festTickets = {}
        scLog.innerHTML = ' ';
        if(festDetails.length !== 0){
            scLog.innerHTML += "We found some festivals : ";
        }
        for(var i = 0; i < festDetails.length; i++){
            txLogic[festDetails[i][0]] = new w3.eth.Contract(TransactionLogic.abi, festDetails[i][2]);
            var ticketsAddress = await txLogic[festDetails[i][0]].methods.getTicketAddress().call({from:accounts[0]});
            festTickets[festDetails[i][0]] = new w3.eth.Contract(FestivalTicket.abi, ticketsAddress);
            if(i < festDetails.length - 1){
                scLog. innerHTML +=  festDetails[i][0] + ", ";
            }else{
                scLog. innerHTML +=  festDetails[i][0];
            }
            
        }
        removeOptions(mintBox);
        removeOptions(organiserBox);
        removeOptions(sellerBox);
        removeOptions(buyerBox);
        removeOptions(OwnerBox);
        for(i = 0; i < festDetails.length; i++){
            mintBox.options.add(new Option(festDetails[i][0]));
            organiserBox.options.add(new Option(festDetails[i][0]));
            sellerBox.options.add(new Option(festDetails[i][0]));
            buyerBox.options.add(new Option(festDetails[i][0]));
            OwnerBox.options.add(new Option(festDetails[i][0]));
        }
        return [festMarketPlace, marketToken, festDetails, festTickets, txLogic];
    }

    const Home = () => {

    var web3 = new Web3(window.ethereum);
    var festivalDetails;
    var festivalMarketPlace;
    var marketPlaceToken;
    var festivalsTickets = {};
    var transactionsLogic =  {};

    const { active, account, chainId } = useWeb3React();

        const onFetchFestivals = async () => {
            try{
                var scLog = document.getElementById('sclog');
                var mintSelectBox = document.getElementById('mintSelect');
                var organiserSelectBox = document.getElementById('organiserSelect');
                var secondarySellerSelectBox = document.getElementById('secondarySellerSelect');
                var secondaryBuyerSelectBox = document.getElementById('secondaryBuyerSelect');
                var ticketOwnersBox = document.getElementById('ticketOwners');
                
                [festivalMarketPlace, marketPlaceToken, festivalDetails, festivalsTickets, transactionsLogic] = await fetchContracts(web3, 
                                                                                                                                    chainId, 
                                                                                                                                    scLog, 
                                                                                                                                    mintSelectBox, 
                                                                                                                                    organiserSelectBox, 
                                                                                                                                    secondarySellerSelectBox, 
                                                                                                                                    secondaryBuyerSelectBox, 
                                                                                                                                    ticketOwnersBox)

                console.log(festivalMarketPlace);                                                                                                                   
            } catch(e){
                scLog.innerHTML = "We could not find the smart contracts, check that metamask is connected to the site";
            } 
        }

    const onGetFMT = async () => {

        const accounts = await web3.eth.getAccounts();
        var scLog = document.getElementById('sclog');
        scLog.innerHTML = 'Transaction pending...';
        var tx = await marketPlaceToken.methods.faucet(accounts[0], web3.utils.toWei('100', 'ether')).send({from: accounts[0]});

        var txHash = tx['transactionHash'];                                                  
        scLog.innerHTML = ' ';
        scLog.innerHTML += `FMT claimed - you can check the status of your transaction <a href= https://rinkeby.etherscan.io/tx/${txHash}> here </a>`;                                       


    }

    const onCreateFestival = async () => {
        try{
            var scLog = document.getElementById('sclog');
            var mintSelectBox = document.getElementById('mintSelect');
            var organiserSelectBox = document.getElementById('organiserSelect');
            var secondarySellerSelectBox = document.getElementById('secondarySellerSelect');
            var secondaryBuyerSelectBox = document.getElementById('secondaryBuyerSelect');
            var ticketOwnersBox = document.getElementById('ticketOwners');
            
            [festivalMarketPlace, marketPlaceToken, festivalDetails, festivalsTickets, transactionsLogic] = await fetchContracts(web3, 
                                                                                                                                chainId, 
                                                                                                                                scLog, 
                                                                                                                                mintSelectBox, 
                                                                                                                                organiserSelectBox, 
                                                                                                                                secondarySellerSelectBox, 
                                                                                                                                secondaryBuyerSelectBox, 
                                                                                                                                ticketOwnersBox)

            // console.log(festivalDetails);                                
            const accounts = await web3.eth.getAccounts();
            scLog.innerHTML = 'Transaction pending...';
            var festivalName = document.getElementById('festivalName').value;
            var festivalSymbol = document.getElementById('festivalSymbol').value;
            var ticketPrice = document.getElementById('ticketPrice').value;
            var organiserCommission = document.getElementById('organiserCommission').value;

            var tx = await festivalMarketPlace.methods.createFestival(festivalName,
                                                            festivalSymbol,
                                                            5,
                                                            web3.utils.toWei(ticketPrice, 'ether'),
                                                            organiserCommission,
                                                            accounts[0],
                                                            FestivalMarketToken.networks[chainId].address).send({from: accounts[0]});

            var txHash = tx['transactionHash'];                                                  
            
            scLog.innerHTML = ' ';
            scLog.innerHTML += `Festival created - you can check the status of your transaction <a href= https://rinkeby.etherscan.io/tx/${txHash}> here </a>`; 
            
            removeOptions(mintSelectBox);
            removeOptions(organiserSelectBox);
            removeOptions(secondarySellerSelectBox);
            removeOptions(secondaryBuyerSelectBox);
            removeOptions(ticketOwnersBox);
            festivalDetails = await festivalMarketPlace.methods.getFestivalsOnMarketPlace().call({from: accounts[0]});
            var newFestId = festivalDetails.length - 1;
            transactionsLogic[festivalDetails[newFestId][0]] = new web3.eth.Contract(TransactionLogic.abi, festivalDetails[newFestId][2]);
            var ticketsAddress = await transactionsLogic[festivalDetails[newFestId][0]].methods.getTicketAddress().call({from:accounts[0]});
            festivalsTickets[festivalDetails[newFestId][0]] = new web3.eth.Contract(FestivalTicket.abi, ticketsAddress);
            for(var i = 0; i < festivalDetails.length; i++){
                mintSelectBox.options.add(new Option(festivalDetails[i][0]));
                organiserSelectBox.options.add(new Option(festivalDetails[i][0]));
                secondarySellerSelectBox.options.add(new Option(festivalDetails[i][0]));
                secondaryBuyerSelectBox.options.add(new Option(festivalDetails[i][0]));
                ticketOwnersBox.options.add(new Option(festivalDetails[i][0]));

                
            }

        }
        catch(e){
            scLog.innerHTML = 'Something went wrong, only the owner of the market place can create new festivals';
        }
            

    }

    const onMintTicket = async () => {
        try{
            const accounts = await web3.eth.getAccounts();
            var selectedFestival = document.getElementById('mintSelect').value;
            var festivalPosition;
            var minted = false;
            var scLog = document.getElementById('sclog');
            scLog.innerHTML = 'Transaction pending...';
            var tx;
            for(var i = 0; i < festivalDetails.length;i++){
                console.log(festivalDetails[i]);
                if(selectedFestival === festivalDetails[i][0]){
                    festivalPosition = i;
                    minted = await festivalsTickets[selectedFestival].methods.getMintStatus().call({from: accounts[0]});
                }
            }
            if(minted){
                alert('tickets have already been minted');
            }
            else{
                tx = await festivalsTickets[selectedFestival].methods.batchMint(5, festivalDetails[festivalPosition][2]).send({from: accounts[0]});
                var txHash = tx['transactionHash'];                                                  
                scLog.innerHTML = ' ';
                scLog.innerHTML += `Tickets minted - you can check the status of your transaction <a href= https://rinkeby.etherscan.io/tx/${txHash}> here </a>`; 
            }
            
        }
        catch(e){
            console.log(e);
            scLog.innerHTML = 'Something went wrong with the transaction. Only the owner of the market place can mint the festival tokens';
        }
    }

    const onGetTicketFromOwner = async () => {
            try{
                const accounts = await web3.eth.getAccounts();
                var selectedFestival = document.getElementById('organiserSelect').value;
                var availableTickets = await festivalsTickets[selectedFestival].methods.getTicketsOwnedByOrganiser().call({from: accounts[0]});
                if(availableTickets.length === 0){
                    alert('There are no tickets available from the organiser of this festival');
                }
                else{
                    var ticketArray = [];
                    for(var i = 0; i < availableTickets.length; i++){
                        ticketArray.push(parseInt(availableTickets[i]));
                    }
                    ticketArray.sort(function(a, b){ return a -b });
                    var organiserTicketsSelectBox = document.getElementById('organiserTicketsSelect');
                    removeOptions(organiserTicketsSelectBox);
                    for(i = 0; i <ticketArray.length; i++){
                        organiserTicketsSelectBox.options.add(new Option(ticketArray[i]));
                    }
                    alert('We found tickets, select the one you want to buy');
                }
            }
            catch(e){
                var scLog = document.getElementById('sclog');
                scLog.innerHTML = 'We could not find tickets for this account';
            }
    }
    const onBuyTicketFromOrganiser = async () => {
        try{
            const accounts = await web3.eth.getAccounts();
            var selectedFestival = document.getElementById('organiserSelect').value;
            var ticketId = document.getElementById('organiserTicketsSelect').value;
            var ticketPrice;
            var txLogicAddress;
            var tx;
            var scLog = document.getElementById('sclog');
            scLog.innerHTML = 'Transaction pending...';
            for(var i = 0; i < festivalDetails.length; i++){
                if(selectedFestival === festivalDetails[i][0]){
                    ticketPrice = festivalDetails[i][3];
                    txLogicAddress = festivalDetails[i][2];
                }
            }
            await marketPlaceToken.methods.approve(txLogicAddress, ticketPrice).send({from:accounts[0]});
            tx = await transactionsLogic[selectedFestival].methods.purchaseOnFirstMarket(ticketId).send({from:accounts[0]});
            var txHash = tx['transactionHash'];                                                  
                scLog.innerHTML = ' ';
                scLog.innerHTML += `Ticket bought - you can check the status of your transaction <a href= https://rinkeby.etherscan.io/tx/${txHash}> here </a>`; 
            
        }
        catch(error){
            scLog.innerHTML = 'Ticket purchase not completed - the owner can never buy tickets or your FMT balance is 0';

        }
    }
    const onGetTicketFromCustomer = async () => {
        try{
            const accounts = await web3.eth.getAccounts();
            var selectedFestival = document.getElementById('secondarySellerSelect').value;
            var availableTickets = await festivalsTickets[selectedFestival].methods.getTicketsOwnedByAddress(accounts[0]).call({from:accounts[0]});
            if(availableTickets.length === 0){
                alert('This account has no ticket');
            }
            else{
                var ticketArray = [];
                for(var i = 0; i < availableTickets.length; i++){
                    ticketArray.push(parseInt(availableTickets[i]));
                }
                ticketArray.sort(function(a,b){return a-b});
                var sellerTicketsSelectBox = document.getElementById('sellerTicketsSelect');
                removeOptions(sellerTicketsSelectBox);
                for(i = 0; i < ticketArray.length; i++){
                    sellerTicketsSelectBox.options.add(new Option(ticketArray[i]));
                }
                alert('We found tickets, select the one you want to sell');
            }
            
        }
        catch(error){
            var scLog = document.getElementById('sclog');
            scLog.innerHTML = 'We could not find tickets for this account';
        }
    }
    const onSellTicketOnSecondaryMarket = async () => {
        try{
            const accounts = await web3.eth.getAccounts();
            var selectedFestival = document.getElementById('secondarySellerSelect').value;
            var ticketId = document.getElementById('sellerTicketsSelect').value;
            var ticketPrice = document.getElementById('secondaryPrice').value;
            var txLogicAddress;
            var tx;
            var scLog = document.getElementById('sclog');
            scLog.innerHTML = 'Transaction pending...';
            for(var i = 0; i < festivalDetails.length; i++){
                if(selectedFestival === festivalDetails[i][0]){
                    txLogicAddress = festivalDetails[i][2];
                }
            }
            tx = await festivalsTickets[selectedFestival].methods.setTicketOnSale(ticketId, 
                                                                        web3.utils.toWei(ticketPrice, 'ether'), 
                                                                        txLogicAddress).send({from:accounts[0]});
            var txHash = tx['transactionHash'];                                                  
            scLog.innerHTML = ' ';
            scLog.innerHTML += `Ticket on sale - you can check the status of your transaction <a href= https://rinkeby.etherscan.io/tx/${txHash}> here </a>`;                                                             
        }
        catch(error){
            scLog.innerHTML = 'We could not set your ticket on sale, fetch the festivals and try again';
        }
    }
    const onGetTicketFromSecondaryMarket = async () => {
        try{
            const accounts = await web3.eth.getAccounts();
            var selectedFestival = document.getElementById('secondaryBuyerSelect').value;
            var availableTickets = await festivalsTickets[selectedFestival].methods.getTicketsOnSecondaryMarket().call({from:accounts[0]});
            if(availableTickets.length === 0){
                alert('No ticket on the secondary market for this festival.');
            }
            else{
                var ticketArray = [];
                for(var i = 0; i < availableTickets.length; i++){
                    ticketArray.push(parseInt(availableTickets[i]));
                }
                ticketArray.sort(function(a,b){return a-b});
                var BuyerTicketsSelectBox = document.getElementById('BuyerTicketsSelect');
                removeOptions(BuyerTicketsSelectBox);
                for(i = 0; i < ticketArray.length; i++){
                    BuyerTicketsSelectBox.options.add(new Option(ticketArray[i]));
                }
                alert('We found tickets, select the one you want to buy');
            }

        }
        catch(error){
            var scLog = document.getElementById('sclog');
            scLog.innerHTML = 'We could not find tickets on the secondary market';
        }
    }
    const onBuyTicketOnSecondaryMarket = async () => {
        try{
            const accounts = await web3.eth.getAccounts();
            var selectedFestival = document.getElementById('secondaryBuyerSelect').value;
            var ticketId = document.getElementById('BuyerTicketsSelect').value;
            var ticketPrice = await festivalsTickets[selectedFestival].methods.getSecondaryMarketSellingPrice(ticketId).call({from:accounts[0]});
            var txLogicAddress;
            var tx;
            var scLog = document.getElementById('sclog');
            scLog.innerHTML = 'Transaction pending...';
            for(var i = 0; i < festivalDetails.length; i++){
                if(selectedFestival === festivalDetails[i][0]){
                    txLogicAddress = festivalDetails[i][2];
                }
            }
            await marketPlaceToken.methods.approve(txLogicAddress, ticketPrice).send({from:accounts[0]});
            tx = await transactionsLogic[selectedFestival].methods.purchaseOnSecondaryMarket(ticketId).send({from:accounts[0]});
            var txHash = tx['transactionHash'];                                                  
            scLog.innerHTML = `Ticket bought on the secondary market - you can check the status of your transaction <a href= https://rinkeby.etherscan.io/tx/${txHash} > here </a>`; 
        }
        catch(error){
            scLog.innerHTML = 'Ticket purchase not completed - the marketplace owner can never buy tickets, customers cannot buy their tickets or your FMT balance is 0';
        }
    }
    const onGetTicketsOwner = async () => {
        try{
            const accounts = await web3.eth.getAccounts();
            var selectedFestival = document.getElementById('ticketOwners').value;
            var ticketsOwner = await festivalsTickets[selectedFestival].methods.getTicketsBuyers().call({from:accounts[0]});
            if(ticketsOwner.length === 0){
                alert('No buyer for this festival yet');
            }
            else{
                var scLog = document.getElementById('sclog');
                scLog.innerHTML = 'Ticket owners: ';
                for(var i = 0; i < ticketsOwner.length; i++){
                    if(i < ticketsOwner.length-1){
                        scLog.innerHTML += ticketsOwner[i] + ', ';
                    }
                    else{
                        scLog.innerHTML += ticketsOwner[i];
                    }    
                }
            }
        }
        catch(error){
            scLog.innerHTML = 'We could not retrieve the owners';
        }

    }
    return (
        <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
            <Text center t1 style={{ marginTop: '20px'}}>
                Fetch existing festivals
            </Text>
            <FestButton onClick={onFetchFestivals}> Fetch festivals </FestButton>
            <Text center t1 style={{ marginTop: '20px'}}>
                get 100 FMT token to test the smart contract functions
            </Text>
            <FestButton onClick={onGetFMT}> Get FMT </FestButton>
            <Text center t1 style={{ marginTop: '20px', marginBottom: '20px' }}>
                Create new festival
            </Text>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label> Festival name</Form.Label>
                    <Form.Control type="text" placeholder="enter festival name" id="festivalName"/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label> Festival symbol</Form.Label>
                    <Form.Control type="text" placeholder="enter festival symbol" id="festivalSymbol"/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label> Ticket price</Form.Label>
                    <Form.Control type="text" placeholder="enter ticket price" id="ticketPrice"/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label> Organiser commission</Form.Label>
                    <Form.Control type="text" placeholder="enter organiser commission" id="organiserCommission"/>
                </Form.Group>
            </Form>
        <FestButton onClick={onCreateFestival}> Create festival </FestButton>

        <Text center t1 style={{marginTop: '20px', marginBottom: '20px'}}>
            Mint the tickets
        </Text>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="mintSelect"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onMintTicket}> Mint tickets </FestButton>
        <Text center t1 style={{marginTop: '20px', marginBottom: '20px'}}>
            Buy from the organiser
        </Text>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="organiserSelect"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onGetTicketFromOwner}> Find tickets </FestButton>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="organiserTicketsSelect"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onBuyTicketFromOrganiser}> Buy ticket</FestButton>
        <Text center t1 style={{marginTop: '20px', marginBottom: '20px'}}>
            Sell on the secondary market
        </Text>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="secondarySellerSelect"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onGetTicketFromCustomer}> Find tickets</FestButton>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="sellerTicketsSelect"></Form.Control>
            </Form.Group>
        </Form>
        <Form>
        <Form.Group className="mb-3">
                <Form.Label> Ticket price</Form.Label>
                <Form.Control type="text" placeholder="ticket price" id="secondaryPrice"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onSellTicketOnSecondaryMarket}>Sell ticket</FestButton>
        <Text center t1 style={{marginTop: '20px', marginBottom: '20px'}}>
            Buy on the secondary market
        </Text>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="secondaryBuyerSelect"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onGetTicketFromSecondaryMarket}> Find tickets</FestButton>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="BuyerTicketsSelect"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onBuyTicketOnSecondaryMarket}>Buy ticket</FestButton>
        <Text center t1 style={{marginTop: '20px', marginBottom: '20px'}}>
            Check tickets owner per festival
        </Text>
        <Form>
            <Form.Group className="mb-3">
                <Form.Control as="select" id="ticketOwners"></Form.Control>
            </Form.Group>
        </Form>
        <FestButton onClick={onGetTicketsOwner}>Get owners</FestButton>
        <Text center t1 style={{marginTop: '20px', marginBottom: '20px'}}>
            Smart contracts logs
        </Text>
        <ListGroup id="sclog">
        </ListGroup>
        </Container>
        
    );
    };

    export default Home;