const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Real Cross-Chain Deposit with Vara Address\n");
  
  const [signer] = await ethers.getSigners();
  console.log("Using wallet:", signer.address);
  
  // Real deployed contract addresses
  const mockUSDCAddress = "0x0737c4a886b8898718881Fd4E2FE9141aBec1244";
  const depositorAddress = "0x34FF03fD5dad9E98C69Cf720C8c68cBF48be4855";
  
  // Your real Vara address
  const varaAddress = "kGhMHjEVm64S9RNK4Vsig6oFXaMwPdyuqBNSNDJk1SnCysYV9";
  
  // Get contract instances
  const MockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const Depositor = await ethers.getContractAt("CrossChainDepositor", depositorAddress);
  
  // Check USDC balance
  const balance = await MockUSDC.balanceOf(signer.address);
  console.log("Current USDC balance:", ethers.formatUnits(balance, 6), "USDC");
  
  if (balance < ethers.parseUnits("100", 6)) {
    console.log("\n🚰 Getting USDC from faucet...");
    const faucetTx = await MockUSDC.faucet();
    await faucetTx.wait();
    console.log("✅ Got 1000 USDC from faucet!");
  }
  
  // Prepare deposit
  const depositAmount = ethers.parseUnits("100", 6); // 100 USDC
  // Convert Vara address to bytes32 for the contract
  const varaAddressBytes32 = ethers.zeroPadValue(ethers.toUtf8Bytes(varaAddress.slice(0, 32)), 32);
  
  console.log("\n💰 Making cross-chain deposit...");
  console.log("Amount:", ethers.formatUnits(depositAmount, 6), "USDC");
  console.log("Vara Address:", varaAddress);
  console.log("Vara Address (bytes32):", varaAddressBytes32);
  
  // Approve USDC spending
  console.log("\n1. Approving USDC...");
  const approveTx = await MockUSDC.approve(depositorAddress, depositAmount);
  await approveTx.wait();
  console.log("✅ USDC approved");
  
  // Make deposit
  console.log("\n2. Making deposit...");
  const depositTx = await Depositor.depositForStaking(depositAmount, varaAddressBytes32);
  console.log("Transaction hash:", depositTx.hash);
  
  // Wait for confirmation
  const receipt = await depositTx.wait();
  console.log("✅ Deposit confirmed in block:", receipt.blockNumber);
  
  // Parse events
  console.log("\n📡 Events emitted:");
  for (const log of receipt.logs) {
    try {
      const parsed = Depositor.interface.parseLog(log);
      if (parsed.name === "DepositForStaking") {
        console.log("🎯 DepositForStaking event:");
        console.log("  - User:", parsed.args.user);
        console.log("  - Amount:", ethers.formatUnits(parsed.args.amount, 6), "USDC");
        console.log("  - Vara Address (bytes32):", parsed.args.varaAddress);
      }
    } catch (e) {
      // Skip non-matching logs
    }
  }
  
  console.log("\n🎉 Cross-chain deposit successful!");
  console.log("🔄 This event is ready for the relayer to process");
  console.log("📋 Vara Program ID:", "0x8ac4ffcad1e5c6d017336483384ad15ca82a56979e98b3f638819a10889b4682");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
