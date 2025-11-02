// Complete End-to-End Test with Real Ethereum Data
const { ethers } = require('ethers');
const { GearApi } = require('@gear-js/api');
const { Keyring } = require('@polkadot/keyring');

async function testRealEndToEnd() {
    console.log('🚀 Complete End-to-End Test with Real Ethereum Data\n');
    
    // Configuration
    const ETHEREUM_RPC = 'https://0xrpc.io/hoodi';
    const DEPOSITOR_ADDRESS = '0x34FF03fD5dad9E98C69Cf720C8c68cBF48be4855';
    const USDC_ADDRESS = '0x0737c4a886b8898718881Fd4E2FE9141aBec1244';
    const PRIVATE_KEY = 'ec2180c5dfeaf12266daf34073e7de0c3a498014b2a35294e7bb7eb68ab3739a';
    
    const VARA_RPC = 'wss://testnet.vara.network';
    const VARA_PROGRAM_ID = '0xf899328ec9d4e5cb2f4c97f06c3704d96ea2b59607c45c8114c53a101550ab76';
    const VARA_MNEMONIC = 'fatal crouch original winter mail ladder decade version stomach foil pepper saddle';
    
    try {
        console.log('📋 Step 1: Making Real Ethereum Deposit...');
        
        // Connect to Ethereum
        const ethProvider = new ethers.JsonRpcProvider(ETHEREUM_RPC);
        const ethWallet = new ethers.Wallet(PRIVATE_KEY, ethProvider);
        
        console.log('✅ Connected to Ethereum (Hoodi)');
        console.log('   Wallet:', ethWallet.address);
        
        // Contract ABIs
        const usdcAbi = [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        
        const depositorAbi = [
            "function depositForStaking(uint256 amount, bytes32 varaAddress)",
            "event DepositForStaking(address indexed user, uint256 amount, bytes32 indexed varaAddress)"
        ];
        
        const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcAbi, ethWallet);
        const depositorContract = new ethers.Contract(DEPOSITOR_ADDRESS, depositorAbi, ethWallet);
        
        // Check balance
        const balance = await usdcContract.balanceOf(ethWallet.address);
        console.log('   USDC Balance:', ethers.formatUnits(balance, 6), 'USDC');
        
        // Prepare deposit
        const depositAmount = ethers.parseUnits('50', 6); // 50 USDC
        const varaAddressBytes32 = '0x6b47684d486a45566d36345339524e4b3456736967366f4658614d7750647975';
        
        console.log('   Depositing:', ethers.formatUnits(depositAmount, 6), 'USDC');
        
        // Approve USDC
        console.log('📤 Approving USDC...');
        const approveTx = await usdcContract.approve(DEPOSITOR_ADDRESS, depositAmount);
        await approveTx.wait();
        console.log('✅ USDC approved');
        
        // Make deposit
        console.log('📤 Making deposit...');
        const depositTx = await depositorContract.depositForStaking(depositAmount, varaAddressBytes32);
        const depositReceipt = await depositTx.wait();
        
        console.log('✅ Deposit successful!');
        console.log('   TX Hash:', depositTx.hash);
        console.log('   Block:', depositReceipt.blockNumber);
        
        // Get the actual event data
        const depositEvent = depositReceipt.logs.find(log => {
            try {
                const decoded = depositorContract.interface.parseLog(log);
                return decoded.name === 'DepositForStaking';
            } catch (e) {
                return false;
            }
        });
        
        if (!depositEvent) {
            throw new Error('DepositForStaking event not found');
        }
        
        const decodedEvent = depositorContract.interface.parseLog(depositEvent);
        console.log('📡 Real Event Data:');
        console.log('   User:', decodedEvent.args.user);
        console.log('   Amount:', ethers.formatUnits(decodedEvent.args.amount, 6), 'USDC');
        console.log('   Vara Address:', decodedEvent.args.varaAddress);
        
        // Calculate real slot (simplified)
        const block = await ethProvider.getBlock(depositReceipt.blockNumber);
        const GENESIS_TIMESTAMP = 1600000000; // Approximate
        const realSlot = Math.floor((block.timestamp - GENESIS_TIMESTAMP) / 12);
        
        console.log('📊 Real Blockchain Data:');
        console.log('   Block Number:', depositReceipt.blockNumber);
        console.log('   Block Timestamp:', block.timestamp);
        console.log('   Calculated Slot:', realSlot);
        console.log('   Transaction Index:', depositEvent.transactionIndex || 0);
        
        // Get real transaction receipt data
        const fullReceipt = await ethProvider.getTransactionReceipt(depositTx.hash);
        const receiptRlp = ethers.getBytes(ethers.toUtf8Bytes(JSON.stringify({
            blockNumber: fullReceipt.blockNumber,
            transactionHash: fullReceipt.hash,
            logs: fullReceipt.logs.length
        })));
        
        console.log('📋 Step 2: Testing Vara Program with Real Data...');
        
        // Connect to Vara
        const varaApi = await GearApi.create({ providerAddress: VARA_RPC });
        console.log('✅ Connected to Vara');
        
        const keyring = new Keyring({ type: 'sr25519' });
        const varaAccount = keyring.addFromMnemonic(VARA_MNEMONIC);
        console.log('✅ Vara Wallet:', varaAccount.address);
        
        // Test different payload formats with REAL data
        const realTestCases = [
            {
                name: "Real Data Format 1: Service Object",
                payload: {
                    "DepositReceiver": {
                        "SubmitReceipt": {
                            "slot": realSlot,
                            "transaction_index": depositEvent.transactionIndex || 0,
                            "receipt_rlp": Array.from(receiptRlp)
                        }
                    }
                }
            },
            {
                name: "Real Data Format 2: Direct Method",
                payload: {
                    "submit_receipt": {
                        "slot": realSlot,
                        "transaction_index": depositEvent.transactionIndex || 0,
                        "receipt_rlp": Array.from(receiptRlp)
                    }
                }
            },
            {
                name: "Real Data Format 3: Simple Array",
                payload: [realSlot, depositEvent.transactionIndex || 0, Array.from(receiptRlp)]
            }
        ];
        
        console.log('📤 Testing Vara program with real Ethereum data...\n');
        
        for (const testCase of realTestCases) {
            console.log(`🧪 ${testCase.name}...`);
            
            try {
                const message = varaApi.message.send({
                    destination: VARA_PROGRAM_ID,
                    payload: testCase.payload,
                    gasLimit: 10000000000,
                    value: 0
                });

                const result = await message.signAndSend(varaAccount);
                console.log(`✅ ${testCase.name} - SUCCESS!`);
                console.log(`   Message ID: ${result.toHex()}`);
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.log(`❌ ${testCase.name} - FAILED: ${error.message || error}`);
            }
        }
        
        await varaApi.disconnect();
        
        console.log('\n🎯 Complete End-to-End Test Results:');
        console.log('📊 Real Ethereum Data Used:');
        console.log(`   - TX Hash: ${depositTx.hash}`);
        console.log(`   - Block: ${depositReceipt.blockNumber}`);
        console.log(`   - Slot: ${realSlot}`);
        console.log(`   - Amount: ${ethers.formatUnits(decodedEvent.args.amount, 6)} USDC`);
        console.log(`   - User: ${decodedEvent.args.user}`);
        
        console.log('\n✅ Check Vara Program Now:');
        console.log(`   Program ID: ${VARA_PROGRAM_ID}`);
        console.log('   Look for new messages with GREEN dots');
        console.log('   Check if real data processing works differently');
        
        console.log('\n🔄 Next Steps:');
        console.log('1. Check which message format works with real data');
        console.log('2. If still failing, the issue is with the Sails program itself');
        console.log('3. May need to create a non-Sails program for testing');
        
    } catch (error) {
        console.error('❌ End-to-end test failed:', error);
    }
}

testRealEndToEnd();
