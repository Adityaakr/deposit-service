const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to network:", network.name);
  
  // Deploy MockUSDC first
  console.log("\n1. Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("MockUSDC deployed to:", mockUSDCAddress);
  
  // Deploy CrossChainDepositor
  console.log("\n2. Deploying CrossChainDepositor...");
  const CrossChainDepositor = await ethers.getContractFactory("CrossChainDepositor");
  const depositor = await CrossChainDepositor.deploy(mockUSDCAddress);
  await depositor.waitForDeployment();
  const depositorAddress = await depositor.getAddress();
  console.log("CrossChainDepositor deployed to:", depositorAddress);
  
  // Mint some USDC to deployer for testing
  console.log("\n3. Minting test USDC...");
  const [deployer] = await ethers.getSigners();
  await mockUSDC.mint(deployer.address, ethers.parseUnits("10000", 6)); // 10,000 USDC
  console.log("Minted 10,000 USDC to deployer:", deployer.address);
  
  console.log("\n=== Deployment Summary ===");
  console.log("MockUSDC:", mockUSDCAddress);
  console.log("CrossChainDepositor:", depositorAddress);
  console.log("Network:", network.name);
  
  // Save addresses to file for relayer
  const fs = require('fs');
  const addresses = {
    mockUSDC: mockUSDCAddress,
    crossChainDepositor: depositorAddress,
    network: network.name
  };
  fs.writeFileSync('./deployed-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("Addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
