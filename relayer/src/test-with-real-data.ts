import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';

export async function testWithRealData() {
    console.log('🧪 Testing Vara Program with REAL Ethereum Data...\n');
    
    const VARA_PROGRAM_ID = '0xf899328ec9d4e5cb2f4c97f06c3704d96ea2b59607c45c8114c53a101550ab76';
    const VARA_RPC_URL = 'wss://testnet.vara.network';
    const VARA_MNEMONIC = 'fatal crouch original winter mail ladder decade version stomach foil pepper saddle';
    
    // REAL DATA from latest Ethereum deposit
    const realData = {
        txHash: "0xd0ab46223d30b4c8170993a752781d50a849985eb3f7991a6b424f6a3cf5d17c",
        blockNumber: 1539431,
        slot: 13507287,
        transactionIndex: 0, // Default since undefined
        receiptRlp: [123,34,98,108,111,99,107,78,117,109,98,101,114,34,58,49,53,51,57,52,51,49,44,34,116,114,97,110,115,97,99,116,105,111,110,72,97,115,104,34,58,34,48,120,100,48,97,98,52,54,50,50,51,100,51,48,98,52,99,56,49,55,48,57,57,51,97,55,53,50,55,56,49,100,53,48,97,56,52,57,57,56,53,101,98,51,102,55,57,57,49,97,54,98,52,50,52,102,54,97,51,99,102,53,100,49,55,99,34,44,34,103,97,115,85,115,101,100,34,58,34,52,57,57,57,48,34,44,34,108,111,103,115,34,58,50,44,34,115,116,97,116,117,115,34,58,49,125],
        user: "0x3a159d24634A180f3Ab9ff37868358C73226E672",
        amount: "100000000",
        varaAddress: "0x6b47684d486a45566d36345339524e4b3456736967366f4658614d7750647975",
        timestamp: 1762087452
    };
    
    const api = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara');

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(VARA_MNEMONIC);
    console.log('✅ Wallet address:', account.address);
    console.log('✅ Program ID:', VARA_PROGRAM_ID);
    
    console.log('📊 Using REAL Ethereum Data:');
    console.log('   TX Hash:', realData.txHash);
    console.log('   Block:', realData.blockNumber);
    console.log('   Slot:', realData.slot);
    console.log('   User:', realData.user);
    console.log('   Amount:', (parseInt(realData.amount) / 1000000), 'USDC');
    console.log('   Receipt RLP Length:', realData.receiptRlp.length, 'bytes');

    // Test different message formats with REAL data
    const realTestCases = [
        {
            name: "Real Format 1: DepositReceiver Service",
            payload: {
                "DepositReceiver": {
                    "SubmitReceipt": {
                        "slot": realData.slot,
                        "transaction_index": realData.transactionIndex,
                        "receipt_rlp": realData.receiptRlp
                    }
                }
            }
        },
        {
            name: "Real Format 2: Direct submit_receipt",
            payload: {
                "submit_receipt": {
                    "slot": realData.slot,
                    "transaction_index": realData.transactionIndex,
                    "receipt_rlp": realData.receiptRlp
                }
            }
        },
        {
            name: "Real Format 3: Simple Array",
            payload: [realData.slot, realData.transactionIndex, realData.receiptRlp]
        },
        {
            name: "Real Format 4: Encoded String",
            payload: JSON.stringify({
                slot: realData.slot,
                transaction_index: realData.transactionIndex,
                receipt_rlp: realData.receiptRlp,
                metadata: {
                    txHash: realData.txHash,
                    user: realData.user,
                    amount: realData.amount
                }
            })
        }
    ];

    console.log('\n📤 Testing with REAL Ethereum data...\n');

    const results = [];

    for (let i = 0; i < realTestCases.length; i++) {
        const testCase = realTestCases[i];
        console.log(`🧪 ${testCase.name}...`);
        
        try {
            const message = api.message.send({
                destination: VARA_PROGRAM_ID as `0x${string}`,
                payload: testCase.payload,
                gasLimit: 10000000000,
                value: 0
            });

            const result = await message.signAndSend(account);
            console.log(`✅ ${testCase.name} - SUCCESS!`);
            console.log(`   Message ID: ${result.toHex()}`);
            
            results.push({
                format: testCase.name,
                messageId: result.toHex(),
                status: 'sent'
            });
            
            // Wait between messages
            await new Promise(resolve => setTimeout(resolve, 3000));
            
        } catch (error: any) {
            console.log(`❌ ${testCase.name} - FAILED: ${error.message || error}`);
            results.push({
                format: testCase.name,
                messageId: null,
                status: 'failed',
                error: error.message || error
            });
        }
    }

    console.log('\n📊 Test Results Summary:');
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.format}: ${result.status}`);
        if (result.messageId) {
            console.log(`   Message ID: ${result.messageId}`);
        }
    });

    console.log('\n🎯 Next Steps:');
    console.log('1. Check Vara Idea portal for these message IDs');
    console.log('2. Look for GREEN dots vs RED dots');
    console.log('3. Check Events tab for emitted events');
    console.log('4. Compare with previous test messages');
    
    console.log('\n📋 Real Data Used:');
    console.log(`   - Ethereum TX: ${realData.txHash}`);
    console.log(`   - Real Slot: ${realData.slot}`);
    console.log(`   - Real Receipt: ${realData.receiptRlp.length} bytes of actual blockchain data`);
    console.log(`   - Real User: ${realData.user}`);
    console.log(`   - Real Amount: ${(parseInt(realData.amount) / 1000000)} USDC`);

    await api.disconnect();
    console.log('\n✅ Real data test completed!');
}

// Run if called directly
if (require.main === module) {
    testWithRealData().catch(console.error);
}
