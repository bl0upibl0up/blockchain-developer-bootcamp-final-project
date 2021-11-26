// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./FestivalTicket.sol";
import "./TransactionsLogic.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FestivalMarketPlace is Ownable{
    struct FestivalDetails{
        string festivalName;
        string festivalSymbol;
        address transactionsLogic;
        uint256 ticketPrice;
    }

    event FestivalMarketPlaceCreated(address contractAddress);

    constructor(){
        emit FestivalMarketPlaceCreated(address(this));
    }

    mapping(string => bool) private festivalExists;
    FestivalDetails[] public listOfFestivals;

    event FestivalCreated(string festivalName, address transactionsLogicAddress);

    function createFestival(string memory festivalName, string memory festivalSymbol,
                            uint256 totalSupply, uint256 ticketPrice, uint256 commission,
                            address festivalOrganiser, FestivalMarketToken token) onlyOwner public returns(address){
        //Festivals must have different names
        require(festivalExists[festivalName] == false, 'Festival exists already');
        //The commission cannot be higher than 10%
        require(commission <= 10, 'The organiser commission is to high (<10%)');
        
        FestivalTicket newTickets = new FestivalTicket(festivalName, festivalSymbol, totalSupply, ticketPrice, festivalOrganiser);
        
        //The transactions logic contract is linked to the NFT here. 
        TransactionsLogic festivalTransactionsLogic = new TransactionsLogic(address(token), address(newTickets), commission);
        
        FestivalDetails memory festDetails = FestivalDetails({
            festivalName: festivalName,
            festivalSymbol: festivalSymbol,
            ticketPrice: ticketPrice,
            transactionsLogic: address(festivalTransactionsLogic)});
            festivalExists[festivalName] = true;
            listOfFestivals.push(festDetails);
            
            emit FestivalCreated(festivalName, address(festivalTransactionsLogic));
            // returning the transactions logic address let us create the contract directly in the dapp with the abi and the address. 
            return address(festivalTransactionsLogic);
    }
    /* This function let us easily get the different festivals that have already been created by the organiser.
    It is used to load the contracts that are deployed on the blockchain in the dapp. */
    function getFestivalsOnMarketPlace() public view returns(FestivalDetails[] memory){
        return listOfFestivals;
    }
}