// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RealUSDC - Production-like USDC implementation
 * @dev This is a more realistic USDC token without faucet functionality
 */
contract RealUSDC is ERC20, Ownable {
    uint8 private _decimals = 6; // USDC has 6 decimals
    
    // Blacklist functionality like real USDC
    mapping(address => bool) public blacklisted;
    
    event Blacklisted(address indexed account);
    event UnBlacklisted(address indexed account);
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }
    
    constructor(uint256 initialSupply) ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**_decimals);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    // Only owner can mint (like Circle for real USDC)
    function mint(address to, uint256 amount) external onlyOwner notBlacklisted(to) {
        _mint(to, amount);
    }
    
    // Burn functionality
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    // Blacklist functionality
    function blacklist(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }
    
    function unBlacklist(address account) external onlyOwner {
        blacklisted[account] = false;
        emit UnBlacklisted(account);
    }
    
    // Override transfers to check blacklist
    function transfer(address to, uint256 amount) public override notBlacklisted(msg.sender) notBlacklisted(to) returns (bool) {
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override notBlacklisted(from) notBlacklisted(to) returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}
