// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/// @title A festival market place
/// @author Ambroise Moreau
/// @notice This contract is the ERC721 that is used to mint the festival tickets

contract FestivalTicket is Context, AccessControl, ERC721{
    using Counters for Counters.Counter;
    // @dev counter used to keep track of the id of the minted ticket
    Counters.Counter private _ticketId;
    /// @dev bytes32 representing the organiser_role
    bytes32 public constant ORGANISER_ROLE=keccak256("ORGANISER_ROLE");
    /// @dev address of the festivalOrganiser
    address private _festivalOrganiser;
    
    /// @dev Struct holding the ticketInfo
    struct TicketInfo{
        //@dev last purchase price
        uint256 purchasedAt;
        //@dev selling price
        uint256 sellingAt;
        //@dev ticket is on sale on the secondary market
        bool forSale;
    }
    /// @dev to check if the tickets have already been minted
    bool private _minted;
    /// @dev initial price
    uint256 private _initTicketPrice;
    /// @dev ticket supply
    uint256 private _totalSupply;
    
    /// @dev mapping holding the ticketsInfo of all the tickets
    mapping(uint256 => TicketInfo) ticketsHistory;
    /// @dev array that holds the id of the tickets on sale on the secondary market
    uint256[] private ticketsOnSecondaryMarket;
    /// @dev mapping to check which tickets are owned by one address
    mapping(address => uint256[]) ticketsOwnedByAddress;
    /// @dev array of ticket buyers
    address[] private ticketBuyers;
    /// @dev tickets that are under the control of the owner
    uint256[] private ticketsOwnedByOrganiser;
    /// @notice event emitted when tickets have been minted
    event BatchMinted();
    /// @dev ERC721 constructor
    /// @param festivalName name of the festival
    /// @param festivalSymbol symbol of the festival
    /// @param totalSupply total supply of the tickets
    /// @param initTicketPrice initial ticket price
    /// @param festivalOrganiser address of the festival organiser
    constructor(string memory festivalName, string memory festivalSymbol,
                uint256 totalSupply, uint256 initTicketPrice, address festivalOrganiser)
                ERC721(festivalName, festivalSymbol){
                    _setupRole(ORGANISER_ROLE, festivalOrganiser);
                    _totalSupply = totalSupply;
                    _initTicketPrice = initTicketPrice;
                    _festivalOrganiser = festivalOrganiser;
                }
    /// @notice check if ticket is on sale
    /// @param ticketId id of the ticket
    modifier isOnSale(uint256 ticketId){
        require(ticketsHistory[ticketId].forSale, 'Ticket is not on sale');
        _;
    }
    /// @notice function that mints the ticket. They are minted to the address of the transactionsLogic smart contract linked to the festival
    /// @param numberOfTickets The number of tickets minted in the batch
    /// @param operator The address of the operator. The NFT are minted to this address.
    function batchMint(uint256 numberOfTickets, address operator) public virtual{
        // ony the organiser can start the mint process
        require(hasRole(ORGANISER_ROLE, _msgSender()), 'Not the organiser');
        require(_ticketId.current() + numberOfTickets <= _totalSupply, "Cannot mint more than total supply");
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
    /// @notice transfer the NFT when it is bought on the primary market
    /// @param buyer address of the customer buying the ticket
    /// @param ticketId id of the ticket the customer wants to buy
    function primaryPurchaseTransfer(address buyer, uint256 ticketId) public{
        require(ownerOf(ticketId) == msg.sender, 'Trying to transfer from the wrong account');
        require(buyer != _festivalOrganiser, 'The organiser cannot buy tickets');
        transferFrom(ownerOf(ticketId), buyer, ticketId);
        bool existingBuyer = false;
        // the remainder is just to track the ticket through the different users an provide an accurate history in the frontend 
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
    /// @notice transfer the NFT when it is bought on the secondary market
    /// @param ticketId id of the ticket the customer wants to buy
    function secondaryPurchaseTransfer(address buyer, uint256 ticketId) public{
        require(ownerOf(ticketId) != _festivalOrganiser, "The organiser can't sell");
        require(ownerOf(ticketId) != buyer, "The buyer already owns the ticket");
        require(buyer != _festivalOrganiser, "The organiser cannot buy");
        address previousOwner = ownerOf(ticketId);
        transferFrom(ownerOf(ticketId), buyer, ticketId);
        // the remainder is just to track the ticket through the different users an provide an accurate history in the frontend
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
    /// @notice let customers set their tickets on sale
    /// @param newPrice new price on the secondary market
    /// @param operator needs to be approved so that the ticket can be transferred when it is bought
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
    /// @notice get festival organiser
    /// @return address of the festival organiser
    function getOrganiser() public view returns(address){
        return _festivalOrganiser;
    }
    /// @notice get selling price on primary market
    /// @return selling price
    function getInitSellingPrice() public view returns(uint256){
        return _initTicketPrice;
    }
    /// @notice get price on secondary market
    /// @param ticketId id of the ticket
    /// @return selling price on secondary market
    function getSecondaryMarketSellingPrice(uint256 ticketId) isOnSale(ticketId) public view returns(uint256){
        return ticketsHistory[ticketId].sellingAt;
    }
    /// @notice get the info related to a particular ticket
    /// @param ticketId id of the ticket
    /// @return price of purchase, selling price (if any), if ticket on sale
    function getTicketInfo(uint256 ticketId) public view returns(uint256, uint256, bool){
        return(ticketsHistory[ticketId].purchasedAt, 
               ticketsHistory[ticketId].sellingAt,
               ticketsHistory[ticketId].forSale);
    }
    /// @notice get the minting status
    /// @return true if tickets have been minted
    function getMintStatus() public view returns (bool){
        return _minted;
    }
    /// @notice get the tickets on sale on the secondary market
    /// @return ticketsOnSecondaryMarket
    function getTicketsOnSecondaryMarket() public view returns(uint256[] memory){
        return ticketsOnSecondaryMarket;
    }
    /// @notice get the tickets owned by one address
    /// @return list of tickets owned by the address
    function getTicketsOwnedByAddress(address buyer) public view returns(uint256[] memory){
        return ticketsOwnedByAddress[buyer];
    }
    /// @notice get the tickets that are controlled by the organiser
    /// @return list of tickets controlled by the organiser
    function getTicketsOwnedByOrganiser() public view returns(uint256[] memory){
        return ticketsOwnedByOrganiser;
    }
    /// @notice get the list of customers who bought
    /// @return list of buyers
    function getTicketsBuyers() public view returns(address[] memory){
        return ticketBuyers;
    }
    /// @notice check if support interface 
    /// @return true if supports
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}