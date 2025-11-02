const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Full Cross-Chain Staking Test\n');
console.log('This will test both Ethereum and Vara sides simultaneously\n');

// Test 1: Ethereum Side
console.log('📡 Terminal 1: Testing Ethereum Side (Hoodi Testnet)');
console.log('=' .repeat(60));

const ethTest = spawn('npx', ['hardhat', 'run', 'scripts/test-real-deposit.js', '--network', 'hoodi'], {
  cwd: path.join(__dirname, 'eth-depositor'),
  stdio: 'inherit'
});

ethTest.on('close', (code) => {
  console.log('\n' + '='.repeat(60));
  if (code === 0) {
    console.log('✅ Ethereum test completed successfully');
    
    // Test 2: Vara Side
    setTimeout(() => {
      console.log('\n🔗 Terminal 2: Testing Vara Side');
      console.log('=' .repeat(60));
      
      const varaTest = spawn('node', ['simple-vara-test.js'], {
        cwd: path.join(__dirname, 'staking-receiver'),
        stdio: 'inherit'
      });
      
      varaTest.on('close', (varaCode) => {
        console.log('\n' + '='.repeat(60));
        if (varaCode === 0) {
          console.log('✅ Vara test completed successfully');
          console.log('\n🎉 FULL CROSS-CHAIN TEST COMPLETED!');
          console.log('\n📋 Summary:');
          console.log('   ✅ Ethereum: Deposit successful, event emitted');
          console.log('   ✅ Vara: Program ready to receive cross-chain messages');
          console.log('   🔄 Next: Set up relayer for automatic bridge processing');
        } else {
          console.log('❌ Vara test failed');
        }
      });
      
      varaTest.on('error', (error) => {
        console.error('❌ Error running Vara test:', error.message);
      });
      
    }, 2000); // 2 second delay between tests
    
  } else {
    console.log('❌ Ethereum test failed');
  }
});

ethTest.on('error', (error) => {
  console.error('❌ Error running Ethereum test:', error.message);
});
