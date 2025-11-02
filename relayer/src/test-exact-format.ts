import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';

export async function testExactFormat() {
    console.log('🧪 Testing Exact Vara Idea Portal Format...\n');
    
    const NEW_PROGRAM_ID = '0xf899328ec9d4e5cb2f4c97f06c3704d96ea2b59607c45c8114c53a101550ab76';
    const VARA_RPC_URL = 'wss://testnet.vara.network';
    const VARA_MNEMONIC = 'fatal crouch original winter mail ladder decade version stomach foil pepper saddle';
    
    const api = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara');

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(VARA_MNEMONIC);
    console.log('✅ Wallet address:', account.address);
    console.log('✅ New Program ID:', NEW_PROGRAM_ID);

    // Test the EXACT format that Vara Idea portal uses
    console.log('📤 Testing exact Vara Idea portal format...\n');

    try {
        // This is the exact format from the Vara Idea portal interface
        const exactPayload = {
            "DepositReceiver": {
                "SubmitReceipt": {
                    "slot": "13507400",
                    "transaction_index": "0", 
                    "receipt_rlp": [1, 2, 3]
                }
            }
        };

        console.log('🧪 Exact Portal Format...');
        console.log('Payload:', JSON.stringify(exactPayload, null, 2));
        
        const message = api.message.send({
            destination: NEW_PROGRAM_ID as `0x${string}`,
            payload: exactPayload,
            gasLimit: 10000000000,
            value: 0
        });

        const result = await message.signAndSend(account);
        console.log('✅ Exact Portal Format - SUCCESS!');
        console.log('   Message ID:', result.toHex());
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error: any) {
        console.log('❌ Exact Portal Format - FAILED:', error.message || error);
    }

    // Try with numeric values instead of strings
    try {
        const numericPayload = {
            "DepositReceiver": {
                "SubmitReceipt": {
                    "slot": 13507401,
                    "transaction_index": 0,
                    "receipt_rlp": [1, 2, 3]
                }
            }
        };

        console.log('\n🧪 Numeric Values Format...');
        console.log('Payload:', JSON.stringify(numericPayload, null, 2));
        
        const message2 = api.message.send({
            destination: NEW_PROGRAM_ID as `0x${string}`,
            payload: numericPayload,
            gasLimit: 10000000000,
            value: 0
        });

        const result2 = await message2.signAndSend(account);
        console.log('✅ Numeric Values Format - SUCCESS!');
        console.log('   Message ID:', result2.toHex());
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error: any) {
        console.log('❌ Numeric Values Format - FAILED:', error.message || error);
    }

    // Try with empty receipt_rlp to test validation
    try {
        const emptyReceiptPayload = {
            "DepositReceiver": {
                "SubmitReceipt": {
                    "slot": 13507402,
                    "transaction_index": 0,
                    "receipt_rlp": []
                }
            }
        };

        console.log('\n🧪 Empty Receipt Test (should fail gracefully)...');
        
        const message3 = api.message.send({
            destination: NEW_PROGRAM_ID as `0x${string}`,
            payload: emptyReceiptPayload,
            gasLimit: 10000000000,
            value: 0
        });

        const result3 = await message3.signAndSend(account);
        console.log('✅ Empty Receipt Test - SUCCESS!');
        console.log('   Message ID:', result3.toHex());
        
    } catch (error: any) {
        console.log('❌ Empty Receipt Test - FAILED:', error.message || error);
    }

    console.log('\n🎯 Check Results:');
    console.log('If these still show red dots, the issue might be:');
    console.log('1. Sails framework version compatibility');
    console.log('2. Program compilation issue');
    console.log('3. IDL generation problem');
    console.log('4. Need to use a different message encoding approach');

    await api.disconnect();
    console.log('\n✅ Test completed!');
}

// Run if called directly
if (require.main === module) {
    testExactFormat().catch(console.error);
}
