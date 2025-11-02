import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { VARA_RPC_URL, STAKING_PROGRAM_ID, VARA_MNEMONIC_KEY } from './config';

export async function sendSailsMessage() {
    console.log('📤 Sending Sails-Formatted Message to Vara Program...\n');
    
    // Connect to Vara
    const api = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara');

    // Setup wallet
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
    console.log('✅ Wallet address:', account.address);

    try {
        // Create Sails instance for your program
        const parser = await SailsIdlParser.new();
        const sails = new Sails(parser);
        
        // Use the IDL from your built program
        const idlPath = '../staking-receiver/target/wasm32-gear/release/staking_receiver.idl';
        
        // For now, let's create a simple IDL structure
        const simpleIdl = {
            "version": "0.1.0",
            "types": {},
            "services": {
                "StakingReceiver": {
                    "functions": {
                        "SubmitReceipt": {
                            "args": [
                                {"name": "slot", "type": "u64"},
                                {"name": "transaction_index", "type": "u32"}, 
                                {"name": "receipt_rlp", "type": "Vec<u8>"}
                            ],
                            "return_type": null
                        }
                    }
                }
            }
        };
        
        sails.parseIdl(JSON.stringify(simpleIdl));
        sails.setApi(api);
        sails.setProgramId(STAKING_PROGRAM_ID as `0x${string}`);

        // Test data
        const slot = 13507287;
        const transactionIndex = 0;
        const receiptRlp = new Uint8Array([1, 2, 3]);

        console.log('📡 Message Details:');
        console.log('   - Program ID:', STAKING_PROGRAM_ID);
        console.log('   - Service: StakingReceiver');
        console.log('   - Function: SubmitReceipt');
        console.log('   - Slot:', slot);
        console.log('   - Transaction Index:', transactionIndex);
        console.log('   - Receipt RLP:', Array.from(receiptRlp));

        console.log('\n📤 Sending Sails message...');
        
        // Send using Sails format
        const transaction = sails.services.StakingReceiver.functions.SubmitReceipt(
            slot,
            transactionIndex,
            Array.from(receiptRlp)
        );
        
        transaction.withAccount(account);
        await transaction.calculateGas();
        const result = await transaction.signAndSend();
        
        console.log('✅ Sails message sent successfully!');
        console.log('   - Result:', result);
        
    } catch (error) {
        console.error('❌ Sails format failed:', error);
        
        // Try raw message format
        console.log('\n🔄 Trying raw message format...');
        try {
            // Use the exact format from Vara Idea portal
            const rawPayload = {
                "StakingReceiver": {
                    "SubmitReceipt": [
                        13507287,  // slot as number
                        0,         // transaction_index as number
                        [1, 2, 3]  // receipt_rlp as array
                    ]
                }
            };

            console.log('📡 Raw payload:', JSON.stringify(rawPayload, null, 2));

            const message = api.message.send({
                destination: STAKING_PROGRAM_ID as `0x${string}`,
                payload: rawPayload,
                gasLimit: 10000000000,
                value: 0
            });

            const result = await message.signAndSend(account);
            console.log('✅ Raw message sent successfully!');
            console.log('   - Message ID:', result.toHex());
            
        } catch (rawError) {
            console.error('❌ Raw format also failed:', rawError);
            
            // Try even simpler format
            console.log('\n🔄 Trying simple array format...');
            try {
                const simplePayload = [13507287, 0, [1, 2, 3]];
                
                const simpleMessage = api.message.send({
                    destination: STAKING_PROGRAM_ID as `0x${string}`,
                    payload: simplePayload,
                    gasLimit: 10000000000,
                    value: 0
                });

                const result3 = await simpleMessage.signAndSend(account);
                console.log('✅ Simple message sent successfully!');
                console.log('   - Message ID:', result3.toHex());
                
            } catch (simpleError) {
                console.error('❌ All formats failed:', simpleError);
            }
        }
    }

    console.log('\n⏳ Waiting for message processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🎯 Check your Vara program now!');
    console.log('The message should process without errors (green dot)');

    await api.disconnect();
}

// Run if called directly
if (require.main === module) {
    sendSailsMessage().catch(console.error);
}
