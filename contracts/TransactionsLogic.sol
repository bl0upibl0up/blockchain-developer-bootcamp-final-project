// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "./FestivalMarketToken.sol";
import "./FestivalTicket.sol";

/// @title A festival market place
/// @author Ambroise Moreau
/// @notice This contract is the smart contract that handles the transactions with the FMT when customers buy from both markets

/// @notice interface for the FMT
interface IFestivalMarketToken{
    /// @notice handles the transfer of the ERC20
    /// @param _sender address of the token sender
    /// @param _receiver address of the token receiver
    /// @param price ticket price
    function transferFrom(address _sender, address _receiver, uint256 price) external;
}
// @notice interface for the NFT tickets
interface IFestivalTicket{
    /// @notice get the festival organiser
    /// @return the address of the organiser
    function getOrganiser() external returns(address);
    /// @notice get the initial selling price
    /// @return initial price
    function getInitSellingPrice() external returns(uint256);
    /// @notice transfer the FMT and NFT when purchase from 1st market
    /// @param _buyer address of the customer buying 
    /// @param ticketId id of the ticket the customer wants to buys
    function primaryPurchaseTransfer(address _buyer, uint256 ticketId) external;
    /// @notice transfer the FMT and NFT when purchase from 2d market
    /// @param _buyer address of the customer buying
    /// @param ticketId id of the ticket the customer wants to buy
    function secondaryPurchaseTransfer(address _buyer, uint256 ticketId) external;
    /// @notice get price on secondary market
    /// @param ticketId id of the ticket
    /// @return the price on secondary market
    function getSecondaryMarketSellingPrice(uint256 ticketId) external returns(uint256);
    /// @notice get the owner of a ticket
    /// @param ticketId id of the ticket
    /// @return the address of the owner
    function ownerOf(uint256 ticketId) external returns(address);
    /// @notice get the organiser commission
    /// @return the organiser commission
    function getOrganiserCommission() external returns(uint256);
}

contract TransactionsLogic{
    /// @dev FMT token interface
    IFestivalMarketToken private _IFestivalMarketToken;
    /// @dev NFT token interface
    IFestivalTicket private _IFestivalTicket;
    /// @dev address of the organiser
    address private _organiser;
    /// @dev percentage of the sales that the organiser get on the secondary market
    uint256 _commission;
    /// @notice constructor
    /// @param fmt address of the FMT contract
    /// @param ft address of the NFT contract
    /// @param commission % of the sales
    constructor(address fmt, address ft, uint256 commission){
        _IFestivalMarketToken = IFestivalMarketToken(fmt);
        _IFestivalTicket = IFestivalTicket(ft);
        _organiser = _IFestivalTicket.getOrganiser();
        _commission = commission;

    }
    /// @notice event when ticket is purchased
    event TicketPurchased();
    /// @notice function to purchase on the first market
    /// @param ticketId id of the ticket that is purchased
    function purchaseOnFirstMarket(uint256 ticketId) public{
        _IFestivalMarketToken.transferFrom(msg.sender,
                                           _organiser,
                                           _IFestivalTicket.getInitSellingPrice());
        _IFestivalTicket.primaryPurchaseTransfer(msg.sender, ticketId);
        emit TicketPurchased();
    }
    
    /// @notice function to purchase on the secondary market. Commission is computed here
    /// @param ticketId id of the ticket that is purchased
    function purchaseOnSecondaryMarket(uint256 ticketId) public{
        uint256 ticketPrice = _IFestivalTicket.getSecondaryMarketSellingPrice(ticketId);
        uint256 organiserCommission = (_commission * ticketPrice)/100;
        _IFestivalMarketToken.transferFrom(msg.sender,
                                           _IFestivalTicket.ownerOf(ticketId),
                                           (ticketPrice - organiserCommission));
        _IFestivalMarketToken.transferFrom(msg.sender, _organiser, organiserCommission);
        _IFestivalTicket.secondaryPurchaseTransfer(msg.sender, ticketId);
            emit TicketPurchased();
    }
    /// @notice function to get the NFT smart contract address
    /// @return address of the NFT smart contract
    function getTicketAddress() public view returns(address){
        return address(_IFestivalTicket);
    }
    /// @notice function to get the festival organiser
    /// @return address of organiser
    function getFestivalOrganiser() public returns(address){
        return(_IFestivalTicket.getOrganiser());
    }
}