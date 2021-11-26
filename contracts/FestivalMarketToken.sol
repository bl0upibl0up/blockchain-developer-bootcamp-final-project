// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title an ERC20 token used to purchase tickets
/// @author Ambroise Moreau
/// @notice This contract is an ERC20 smart contract. The FestivalMarketToken is the currency used to buy the tickets

contract FestivalMarketToken is ERC20{
    /// @notice constructor
    constructor() ERC20("FestivalMarketToken", "FMT"){
        _mint(msg.sender, 20000*(10**uint256(decimals())));
    }
    /// @notice faucet function to let user get test currency 
    /// @param recipient address of the account that will receive FMT
    /// @param amount of FMT sent to recipient
    function faucet(address recipient, uint amount) external {
        _mint(recipient, amount);
    }
}