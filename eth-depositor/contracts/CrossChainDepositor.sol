// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CrossChainDepositor is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable usdcToken;
    
    // Event emitted when user deposits USDC for cross-chain staking
    event DepositForStaking(
        address indexed user,
        uint256 amount,
        bytes32 indexed varaAddress // User's Vara address as bytes32
    );
    
    // Event for withdrawals (when funds come back from Vara)
    event WithdrawalProcessed(
        address indexed user,
        uint256 amount
    );
    
    mapping(address => uint256) public totalDeposited;
    mapping(address => uint256) public totalWithdrawn;
    
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC address");
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @notice Deposit USDC to be bridged to Vara for staking
     * @param amount Amount of USDC to deposit (in USDC decimals)
     * @param varaAddress User's Vara address encoded as bytes32
     */
    function depositForStaking(uint256 amount, bytes32 varaAddress) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(varaAddress != bytes32(0), "Invalid Vara address");
        
        // Transfer USDC from user to this contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update tracking
        totalDeposited[msg.sender] += amount;
        
        // Emit event for relayer to pick up
        emit DepositForStaking(msg.sender, amount, varaAddress);
    }
    
    /**
     * @notice Get user's deposit balance
     */
    function getDepositBalance(address user) external view returns (uint256) {
        return totalDeposited[user];
    }
    
    /**
     * @notice Get contract's USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
}
