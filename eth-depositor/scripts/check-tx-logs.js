const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Transaction Logs for DepositForStaking Event\n");
  
  const txHash = "0xd55df404079a882bd6d721465aadca9dfedc328bf6797a3f629d5ee911f6bef6";
  const depositorAddress = "0x34FF03fD5dad9E98C69Cf720C8c68cBF48be4855";
  
  // Connect to Hoodi
  const provider = new ethers.JsonRpcProvider("https://0xrpc.io/hoodi");
  
  // Get transaction receipt
  const receipt = await provider.getTransactionReceipt(txHash);
  
  console.log("📋 Transaction Receipt:");
  console.log("  - Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
  console.log("  - Block:", receipt.blockNumber);
  console.log("  - Gas Used:", receipt.gasUsed.toString());
  console.log("  - Logs Count:", receipt.logs.length);
  
  console.log("\n📡 All Logs:");
  receipt.logs.forEach((log, i) => {
    console.log(`\nLog ${i}:`);
    console.log("  - Address:", log.address);
    console.log("  - Topics:", log.topics);
    console.log("  - Data:", log.data);
    
    // Check if this is from our depositor contract
    if (log.address.toLowerCase() === depositorAddress.toLowerCase()) {
      console.log("  🎯 This is from CrossChainDepositor!");
      
      // Try to decode the event
      const depositorABI = [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "varaAddress",
              "type": "bytes32"
            }
          ],
          "name": "DepositForStaking",
          "type": "event"
        }
      ];
      
      const iface = new ethers.Interface(depositorABI);
      try {
        const decoded = iface.parseLog(log);
        console.log("  ✅ Decoded Event:", decoded.name);
        console.log("    - User:", decoded.args.user);
        console.log("    - Amount:", ethers.formatUnits(decoded.args.amount, 6), "USDC");
        console.log("    - Vara Address (bytes32):", decoded.args.varaAddress);
      } catch (error) {
        console.log("  ❌ Could not decode:", error.message);
      }
    }
  });
  
  console.log("\n🎉 Analysis Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
