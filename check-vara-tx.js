// Check the Vara transaction status
console.log('🔍 Checking Vara Transaction Status...\n');

async function checkVaraTx() {
  const txHash = '0xe582f5c32b17df8a47c01a3d5c85cfc1b7bd4d5f55449299c90a6b329d90f2ef';
  const msgId = '0x58731fdfa647b49349134f77f52245504dce9e40369fc4827524f31e8907f864';
  const blockHash = '0xf2fc4cd9fe422df01ef5acd1f0934e1fec94e1f67331c2b9e15b069250508fc4';
  
  console.log('📋 Transaction Details:');
  console.log('   - TX Hash:', txHash);
  console.log('   - Message ID:', msgId);
  console.log('   - Block Hash:', blockHash);
  console.log('   - Target Program:', '0x8ac4ffcad1e5c6d017336483384ad15ca82a56979e98b3f638819a10889b4682');
  
  console.log('\n🔍 Possible Issues:');
  console.log('1. ❓ Message Format: Historical Proxy might expect different payload format');
  console.log('2. ❓ Route Encoding: The route "StakingReceiverService/SubmitReceipt" might be wrong');
  console.log('3. ❓ Program Interface: Your program might expect different function signature');
  console.log('4. ❓ Bridge Timing: Message might still be processing');
  
  console.log('\n🔧 Debugging Steps:');
  console.log('1. Check Vara Explorer for transaction:', txHash);
  console.log('2. Verify program interface matches relayer expectations');
  console.log('3. Check if Historical Proxy processed the message correctly');
  
  console.log('\n📊 Expected vs Actual:');
  console.log('Expected: New message in your program with DepositFromEthereum event');
  console.log('Actual: Still only 1 message (initialization)');
  
  console.log('\n🎯 Next Actions:');
  console.log('1. Check the program interface in lib.rs');
  console.log('2. Verify the route format matches Sails expectations');
  console.log('3. Test with a simpler direct message to the program');
  
  console.log('\n⚠️  The message was sent to Historical Proxy successfully,');
  console.log('but it may not have reached your program due to format issues.');
}

checkVaraTx();
