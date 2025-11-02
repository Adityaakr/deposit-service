const { ethers } = require("hardhat");

async function main() {
  console.log("Testing cross-chain deposit on Hoodi testnet...\n");
  
  const [signer] = await ethers.getSigners();
  console.log("Using wallet:", signer.address);
  
  // Contract addresses from deployment
  const mockUSDCAddress = "0x0737c4a886b8898718881Fd4E2FE9141aBec1244";
  const depositorAddress = "0x34FF03fD5dad9E98C69Cf720C8c68cBF48be4855";
  
  // Get contract instances
  const MockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const Depositor = await ethers.getContractAt("CrossChainDepositor", depositorAddress);
  
  // Check initial USDC balance
  const initialBalance = await MockUSDC.balanceOf(signer.address);
  console.log("Initial USDC balance:", ethers.formatUnits(initialBalance, 6), "USDC");
  
  // Get more USDC from faucet if needed
  if (initialBalance < ethers.parseUnits("100", 6)) {
    console.log("\n🚰 Getting more USDC from faucet...");
    const faucetTx = await MockUSDC.faucet();
    await faucetTx.wait();
    console.log("✅ Got 1000 USDC from faucet!");
  }
  
  // Check updated balance
  const newBalance = await MockUSDC.balanceOf(signer.address);
  console.log("Updated USDC balance:", ethers.formatUnits(newBalance, 6), "USDC");
  
  // Prepare deposit
  const depositAmount = ethers.parseUnits("100", 6); // 100 USDC
  // Example Vara address as bytes32 (you should use your actual Vara address)
  const varaAddress = "0x1234567890123456789012345678901234567890123456789012345678901234";
  
  console.log("\n💰 Making cross-chain deposit...");
  console.log("Amount:", ethers.formatUnits(depositAmount, 6), "USDC");
  console.log("Vara Address:", varaAddress);
  
  // Approve USDC spending
  console.log("\n1. Approving USDC...");
  const approveTx = await MockUSDC.approve(depositorAddress, depositAmount);
  await approveTx.wait();
  console.log("✅ USDC approved");
  
  // Make deposit
  console.log("\n2. Making deposit...");
  const depositTx = await Depositor.depositForStaking(depositAmount, varaAddress);
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
        console.log("  - Vara Address:", parsed.args.varaAddress);
      }
    } catch (e) {
      // Skip non-matching logs
    }
  }
  
  // Check final balance
  const finalBalance = await MockUSDC.balanceOf(signer.address);
  console.log("\n💳 Final USDC balance:", ethers.formatUnits(finalBalance, 6), "USDC");
  
  // Check depositor contract balance
  const contractBalance = await MockUSDC.balanceOf(depositorAddress);
  console.log("📦 Contract USDC balance:", ethers.formatUnits(contractBalance, 6), "USDC");
  
  console.log("\n🎉 Cross-chain deposit successful!");
  console.log("🔄 The relayer should pick up this event and submit to Vara...");
  console.log("⏰ Bridge finalization takes 15-20 minutes");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
