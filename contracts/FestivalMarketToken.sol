// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FestivalMarketToken is ERC20{
    constructor() ERC20("FestivalMarketToken", "FMT"){
        _mint(msg.sender, 20000*(10**uint256(decimals())));
    }

    function faucet(address recipient, uint amount) external {
        _mint(recipient, amount);
    }
}