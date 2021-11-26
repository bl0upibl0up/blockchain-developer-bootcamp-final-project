// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "./FestivalMarketToken.sol";
import "./FestivalTicket.sol";

interface IFestivalMarketToken{
    function balanceOf(address _address) external returns(uint256);
    function transferFrom(address _sender, address _receiver, uint256 price) external;
    function approve(address _add, uint256 amount) external;
}
interface IFestivalTicket{
    function getOrganiser() external returns(address);
    function getInitSellingPrice() external returns(uint256);
    function primaryPurchaseTransfer(address _buyer, uint256 ticketId) external;
    function secondaryPurchaseTransfer(address _buyer, uint256 ticketId) external;
    function getSecondaryMarketSellingPrice(uint256 ticketId) external returns(uint256);
    function ownerOf(uint256 ticketId) external returns(address);
    function approve(address _to, uint256 ticketId) external;
    function getOrganiserCommission() external returns(uint256);
}

contract TransactionsLogic{
    IFestivalMarketToken private _IFestivalMarketToken;
    IFestivalTicket private _IFestivalTicket;
    address private _organiser;
    uint256 _commission;
    
    constructor(address fmt, address ft, uint256 commission){
        _IFestivalMarketToken = IFestivalMarketToken(fmt);
        _IFestivalTicket = IFestivalTicket(ft);
        _organiser = _IFestivalTicket.getOrganiser();
        _commission = commission;

    }
    event TicketPurchased();

    function purchaseOnFirstMarket(uint256 ticketId) public{
        _IFestivalMarketToken.transferFrom(msg.sender,
                                           _organiser,
                                           _IFestivalTicket.getInitSellingPrice());
        _IFestivalTicket.primaryPurchaseTransfer(msg.sender, ticketId);
        emit TicketPurchased();
    }
    //Transfer the right amount of FMT to the seller and the organiser. The commission is computed here.
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

    function getTicketAddress() public view returns(address){
        return address(_IFestivalTicket);
    }

    function getFestivalOrganiser() public returns(address){
        return(_IFestivalTicket.getOrganiser());
    }
}