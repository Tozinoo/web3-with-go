// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("MyToken", "MTK") {}

    event Minting(address indexed from, address indexed to, uint256 indexed amount);

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit Minting(msg.sender, to, amount);
    }
}
