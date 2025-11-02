import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';
import { VARA_RPC_URL, STAKING_PROGRAM_ID, VARA_MNEMONIC_KEY } from './config';

export async function testCorrectFormat() {
    console.log('🧪 Testing Correct Message Format for Sails Program...\n');
    
    const api = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara');

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
    console.log('✅ Wallet address:', account.address);

    // Test different payload formats to find the working one
    const testCases = [
        {
            name: "Format 1: Service Object with Method",
            payload: {
                "staking_receiver": {
                    "submit_receipt": {
                        "slot": 13507287,
                        "transaction_index": 0,
                        "receipt_rlp": [1, 2, 3]
                    }
                }
            }
        },
        {
            name: "Format 2: Direct Method Call",
            payload: {
                "submit_receipt": {
                    "slot": 13507287,
                    "transaction_index": 0,
                    "receipt_rlp": [1, 2, 3]
                }
            }
        },
        {
            name: "Format 3: Array Parameters",
            payload: {
                "staking_receiver": {
                    "submit_receipt": [13507287, 0, [1, 2, 3]]
                }
            }
        },
        {
            name: "Format 4: Simple Array",
            payload: [13507287, 0, [1, 2, 3]]
        },
        {
            name: "Format 5: Encoded String",
            payload: "submit_receipt(13507287,0,[1,2,3])"
        }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📤 Testing ${testCase.name}...`);
        console.log('Payload:', JSON.stringify(testCase.payload, null, 2));
        
        try {
            const message = api.message.send({
                destination: STAKING_PROGRAM_ID as `0x${string}`,
                payload: testCase.payload,
                gasLimit: 10000000000,
                value: 0
            });

            const result = await message.signAndSend(account);
            console.log(`✅ ${testCase.name} - SUCCESS!`);
            console.log('   - Message ID:', result.toHex());
            
            // Wait a bit for processing
            await new Promise(resolve => setTimeout(resolve, 3000));
            
        } catch (error: any) {
            console.log(`❌ ${testCase.name} - FAILED:`, error.message || error);
        }
    }

    console.log('\n🎯 Check your Vara program messages now!');
    console.log('Look for messages with green dots (successful) vs red dots (failed)');
    console.log('This will help us identify the correct format.');

    await api.disconnect();
}

// Run if called directly
if (require.main === module) {
    testCorrectFormat().catch(console.error);
}
