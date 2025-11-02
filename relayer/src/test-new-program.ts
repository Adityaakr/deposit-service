import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';

export async function testNewProgram() {
    console.log('🧪 Testing New Deployed deposit_receiver Program...\n');
    
    const NEW_PROGRAM_ID = '0xf899328ec9d4e5cb2f4c97f06c3704d96ea2b59607c45c8114c53a101550ab76';
    const VARA_RPC_URL = 'wss://testnet.vara.network';
    const VARA_MNEMONIC = 'fatal crouch original winter mail ladder decade version stomach foil pepper saddle';
    
    const api = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara');

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(VARA_MNEMONIC);
    console.log('✅ Wallet address:', account.address);
    console.log('✅ New Program ID:', NEW_PROGRAM_ID);

    // Test different message formats for the new program
    const testCases = [
        {
            name: "Format 1: New Route with Object",
            payload: {
                "deposit_receiver": {
                    "submit_receipt": {
                        "slot": 13507300,
                        "transaction_index": 0,
                        "receipt_rlp": [1, 2, 3, 4, 5]
                    }
                }
            }
        },
        {
            name: "Format 2: Direct Method Call",
            payload: {
                "submit_receipt": {
                    "slot": 13507301,
                    "transaction_index": 0,
                    "receipt_rlp": [1, 2, 3, 4, 5]
                }
            }
        },
        {
            name: "Format 3: Array Parameters",
            payload: {
                "deposit_receiver": {
                    "submit_receipt": [13507302, 0, [1, 2, 3, 4, 5]]
                }
            }
        },
        {
            name: "Format 4: Simple Array",
            payload: [13507303, 0, [1, 2, 3, 4, 5]]
        }
    ];

    console.log('📤 Testing different message formats...\n');

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`🧪 ${testCase.name}...`);
        
        try {
            const message = api.message.send({
                destination: NEW_PROGRAM_ID as `0x${string}`,
                payload: testCase.payload,
                gasLimit: 10000000000,
                value: 0
            });

            const result = await message.signAndSend(account);
            console.log(`✅ ${testCase.name} - SUCCESS!`);
            console.log(`   Message ID: ${result.toHex()}`);
            
            // Wait a bit for processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error: any) {
            console.log(`❌ ${testCase.name} - FAILED: ${error.message || error}`);
        }
    }

    console.log('\n🎯 Check Results:');
    console.log('1. Go to Vara Idea portal');
    console.log('2. Search for program:', NEW_PROGRAM_ID);
    console.log('3. Check Messages tab');
    console.log('4. Look for GREEN dots (success) vs RED dots (failed)');
    console.log('5. Check Events tab for emitted events');
    
    console.log('\n📊 Expected Success Indicators:');
    console.log('✅ Messages show green dots');
    console.log('✅ Events tab shows: DepositFromEthereum, WUsdcMinted, Staked');
    console.log('✅ No "cannot read properties" errors');

    await api.disconnect();
    console.log('\n✅ Test completed! Check the program in Vara Idea portal.');
}

// Run if called directly
if (require.main === module) {
    testNewProgram().catch(console.error);
}
