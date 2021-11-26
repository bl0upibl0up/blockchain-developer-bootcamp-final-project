// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
contract FestivalTicket is Context, AccessControl, ERC721{
    using Counters for Counters.Counter;
    Counters.Counter private _ticketId;
    bytes32 public constant ORGANISER_ROLE=keccak256("ORGANISER_ROLE");
    
    address private _festivalOrganiser;
    
    struct TicketInfo{
        uint256 purchasedAt;
        uint256 sellingAt;
        bool forSale;
    }
    bool private _minted;
    uint256 private _initTicketPrice;
    uint256 private _totalSupply;
    
    mapping(uint256 => TicketInfo) ticketsHistory;
    //arrays and mapping used to easily get the state of the festival (supply, tickets on the secondary market, etc)
    uint256[] private ticketsOnSecondaryMarket;
    mapping(address => uint256[]) ticketsOwnedByAddress;
    address[] private ticketBuyers;
    uint256[] private ticketsOwnedByOrganiser;
    event BatchMinted();
    constructor(string memory festivalName, string memory festivalSymbol,
                uint256 totalSupply, uint256 initTicketPrice, address festivalOrganiser)
                ERC721(festivalName, festivalSymbol){
                    _setupRole(ORGANISER_ROLE, festivalOrganiser);
                    _totalSupply = totalSupply;
                    _initTicketPrice = initTicketPrice;
                    _festivalOrganiser = festivalOrganiser;
                }
    modifier isOnSale(uint256 ticketId){
        require(ticketsHistory[ticketId].forSale, 'Ticket is not on sale');
        _;
    }
    /*Minting in small batches as minting 1000 tickets at one uses more gas than what is allowed. 
    The numberOfTickets should be a divider of 1000*/

    function batchMint(uint256 numberOfTickets, address operator) public virtual{
        require(hasRole(ORGANISER_ROLE, _msgSender()), 'Not the organiser');
        require(_ticketId.current() + numberOfTickets <= 1000, "Cannot mint more than 1000 tickets");
        for(uint256 i = 0; i < numberOfTickets; i++){
            uint256 currentTicketId = _ticketId.current();
            _mint(operator, currentTicketId);
            ticketsHistory[currentTicketId] = TicketInfo({
                                                purchasedAt: _initTicketPrice,
                                                sellingAt: 0,
                                                forSale: false
                                            });
            ticketsOwnedByOrganiser.push(_ticketId.current());
            _ticketId.increment();
        }
        _minted = true;
        emit BatchMinted();
    }
    //Transfer the NFT with ticketId to the buyer and add it to the list of buyers and to the mapping of tickets owned by addresses
    function primaryPurchaseTransfer(address buyer, uint256 ticketId) public{
        require(ownerOf(ticketId) == msg.sender, 'Trying to transfer from the wrong account');
        require(buyer != _festivalOrganiser, 'The organiser cannot buy tickets');
        transferFrom(ownerOf(ticketId), buyer, ticketId);
        bool existingBuyer = false;
        for(uint256 i = 0; i < ticketBuyers.length; i++){
            if(ticketBuyers[i] == buyer){
                existingBuyer = true;
                ticketsOwnedByAddress[buyer].push(ticketId);
                break;
            }
        }
        if(!existingBuyer){
            ticketBuyers.push(buyer);
            ticketsOwnedByAddress[buyer].push(ticketId);
            }
        for(uint256 i = 0; i < ticketsOwnedByOrganiser.length; i++){
            if(ticketsOwnedByOrganiser[i] == ticketId){
                if(ticketsOwnedByOrganiser.length > 0){
                    ticketsOwnedByOrganiser[i] = ticketsOwnedByOrganiser[ticketsOwnedByOrganiser.length-1];
                    ticketsOwnedByOrganiser.pop();
                }
                else{
                    ticketsOwnedByOrganiser.pop();
                }
                break;
            }
        }
    }
    //Transfer the NFT from the seller to the buyer and update the list of buyers and the mapping of tickets owned by addresses
    function secondaryPurchaseTransfer(address buyer, uint256 ticketId) public{
        require(ownerOf(ticketId) != _festivalOrganiser, "The organiser can't sell");
        require(ownerOf(ticketId) != buyer, "The buyer already owns the ticket");
        require(buyer != _festivalOrganiser, "The organiser cannot buy");
        address previousOwner = ownerOf(ticketId);
        transferFrom(ownerOf(ticketId), buyer, ticketId);
        ticketsHistory[ticketId].purchasedAt = ticketsHistory[ticketId].sellingAt;
        ticketsHistory[ticketId].forSale = false;
        ticketsOwnedByAddress[buyer].push(ticketId);
        for(uint256 i = 0; i < ticketsOnSecondaryMarket.length; i++){
            if(ticketsOnSecondaryMarket[i] == ticketId){
                if(ticketsOnSecondaryMarket.length > 0){
                    ticketsOnSecondaryMarket[i] = ticketsOnSecondaryMarket[ticketsOnSecondaryMarket.length - 1];
                    ticketsOnSecondaryMarket.pop();
                }
                else{
                    ticketsOnSecondaryMarket.pop();
                }
                break;
            }
        }
        for(uint256 i = 0; i < ticketsOwnedByAddress[previousOwner].length; i++){
            if(ticketsOwnedByAddress[previousOwner][i] == ticketId){
                if(ticketsOwnedByAddress[previousOwner].length > 0){
                    ticketsOwnedByAddress[previousOwner][i] = ticketsOwnedByAddress[previousOwner][ticketsOwnedByAddress[previousOwner].length-1];
                    ticketsOwnedByAddress[previousOwner].pop();
                }
                else{
                    ticketsOwnedByAddress[previousOwner].pop();
                }
                break;
            }
        }
        if(ticketsOwnedByAddress[previousOwner].length == 0){
            for(uint256 i = 0; i < ticketBuyers.length; i++){
                if(ticketBuyers[i] == previousOwner){
                    if(ticketBuyers.length > 0){
                        ticketBuyers[i] = ticketBuyers[ticketBuyers.length - 1];
                        ticketBuyers.pop();
                    }
                    else{
                        ticketBuyers.pop();
                    }
                    break;
                }
            }
        }
        ticketBuyers.push(buyer);
    }
    /*Allows a ticket owner, different from the organiser, to set a ticket on sale. 
    The selling price cannot be higher than 210% of the previous price and the organiser cannot sell here. 
    If all the requirement are met, the customer is approved and can transfer the NFT*/
    function setTicketOnSale(uint256 ticketId, uint256 newPrice, address operator) public{
        require(newPrice < ticketsHistory[ticketId].purchasedAt*210/100, "Selling price is to high");
        require(ownerOf(ticketId) == msg.sender, "Account cannot put ticket on sale");
        require(ownerOf(ticketId) != _festivalOrganiser, "Organiser cannot sell on the secondary market");
        //not needed as we allow a customer to put the same ticket on sale multiple times to change the price.
        //require(ticketsHistory[ticketId].forSale == false, \"Ticket already on sale\");
        ticketsHistory[ticketId].sellingAt = newPrice;
        ticketsHistory[ticketId].forSale = true;
        bool ticketOnSale = false;
        for(uint256 i = 0; i < ticketsOnSecondaryMarket.length; i++){
            if(ticketsOnSecondaryMarket[i] == ticketId){
                ticketOnSale = true;
                break;
            }
        }
        if(!ticketOnSale)
            ticketsOnSecondaryMarket.push(ticketId);
        approve(operator, ticketId);
    }
    //Getters used in the dapp
    function getOrganiser() public view returns(address){
        return _festivalOrganiser;
    }

    function getInitSellingPrice() public view returns(uint256){
        return _initTicketPrice;
    }
    
    function getSecondaryMarketSellingPrice(uint256 ticketId) isOnSale(ticketId) public view returns(uint256){
        return ticketsHistory[ticketId].sellingAt;
    }
    
    function getTicketInfo(uint256 ticketId) public view returns(uint256, uint256, bool){
        return(ticketsHistory[ticketId].purchasedAt, 
               ticketsHistory[ticketId].sellingAt,
               ticketsHistory[ticketId].forSale);
    }
    
    function getMintStatus() public view returns (bool){
        return _minted;
    }
    
    function getTicketsOnSecondaryMarket() public view returns(uint256[] memory){
        return ticketsOnSecondaryMarket;
    }
    
    function getTicketsOwnedByAddress(address buyer) public view returns(uint256[] memory){
        return ticketsOwnedByAddress[buyer];
    }
    
    function getTicketsOwnedByOrganiser() public view returns(uint256[] memory){
        return ticketsOwnedByOrganiser;
    }
    
    function getTicketsBuyers() public view returns(address[] memory){
        return ticketBuyers;
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}