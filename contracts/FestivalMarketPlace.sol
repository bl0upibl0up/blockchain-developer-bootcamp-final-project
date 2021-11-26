// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./FestivalTicket.sol";
import "./TransactionsLogic.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A festival market place
/// @author Ambroise Moreau
/// @notice This contract allow you to create festivals for which the tickets are sold as NFTs

contract FestivalMarketPlace is Ownable{

    /// @dev the structure holding the festival details
    struct FestivalDetails{
        string festivalName;
        string festivalSymbol;
        address transactionsLogic;
        uint256 ticketPrice;
    }
    /// @dev mapping to check that we are not creating a festival with an existing name
    mapping(string => bool) private festivalExists;
    /// @dev list of all the festivals created
    FestivalDetails[] public listOfFestivals;

    /// @notice event emitted when a new festival is created
    event FestivalCreated(string festivalName, address transactionsLogicAddress);

    /// @notice function that create a new festival
    /// @param festivalName The festival name
    /// @param festivalSymbol The festival symbol
    /// @param totalSupply The Total supply of ticket
    /// @param ticketPrice the ticket price
    /// @param commission the organiser commission when someone sells on the secondary market
    /// @param festivalOrganiser the organiser of the festival 
    /// @param token the ERC20 currency that is used to purchase the tickets
    /// @return address of the TransactionsLogic contract that controls the transactions when customer buy on the primary and secondary market
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
            /// returning the transactions logic address let us create the contract directly in the dapp with the abi and the address. 
            return address(festivalTransactionsLogic);
    }
    /// @notice get the list of festivals
    /// @return list of festivals
    function getFestivalsOnMarketPlace() public view returns(FestivalDetails[] memory){
        return listOfFestivals;
    }
}