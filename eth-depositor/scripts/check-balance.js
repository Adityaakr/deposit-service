const { ethers } = require("hardhat");

async function main() {
  console.log("Checking wallet on network:", network.name);
  
  const [signer] = await ethers.getSigners();
  console.log('Wallet address:', signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance === 0n) {
    console.log('\n❌ No ETH found! Get Holesky ETH from:');
    console.log('https://holesky-faucet.pk910.de/');
  } else {
    console.log('\n✅ Ready to deploy!');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
