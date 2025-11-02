import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { VARA_RPC_URL, STAKING_PROGRAM_ID, VARA_MNEMONIC_KEY } from './config';

export async function sendDirectMessage() {
    console.log('📤 Sending Direct Message to Vara Program...\n');
    
    // Connect to Vara
    const api = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara');

    // Setup wallet
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
    console.log('✅ Wallet address:', account.address);

    // Test data from latest deposit
    const slot = 13507240;
    const transactionIndex = 0;
    const receiptRlp = [1, 2, 3];

    console.log('📡 Message Details:');
    console.log('   - Destination:', STAKING_PROGRAM_ID);
    console.log('   - Service: StakingReceiver');
    console.log('   - Function: SubmitReceipt');
    console.log('   - Slot:', slot);
    console.log('   - Transaction Index:', transactionIndex);
    console.log('   - Receipt RLP:', receiptRlp);

    try {
        // Create the message payload
        const payload = {
            StakingReceiver: {
                SubmitReceipt: {
                    slot: slot,
                    transaction_index: transactionIndex,
                    receipt_rlp: receiptRlp
                }
            }
        };

        console.log('\n📤 Sending message...');
        
        // Send message to program
        const message = api.message.send({
            destination: STAKING_PROGRAM_ID as `0x${string}`,
            payload: payload,
            gasLimit: 10000000000,
            value: 0
        });

        const result = await message.signAndSend(account);
        console.log('✅ Message sent successfully!');
        console.log('   - Message ID:', result.toHex());
        
        // Wait a bit for processing
        console.log('\n⏳ Waiting for message processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n🎯 Check your Vara program now!');
        console.log('You should see:');
        console.log('   ✅ New message in Messages tab');
        console.log('   ✅ DepositFromEthereum event');
        console.log('   ✅ WUsdcMinted event');
        console.log('   ✅ Staked event');

    } catch (error) {
        console.error('❌ Error sending message:', error);
        
        // Try alternative format
        console.log('\n🔄 Trying alternative format...');
        try {
            const simpleMessage = api.message.send({
                destination: STAKING_PROGRAM_ID as `0x${string}`,
                payload: {
                    service: "StakingReceiver",
                    method: "SubmitReceipt",
                    args: [slot, transactionIndex, receiptRlp]
                },
                gasLimit: 10000000000,
                value: 0
            });

            const result2 = await simpleMessage.signAndSend(account);
            console.log('✅ Alternative message sent!');
            console.log('   - Message ID:', result2.toHex());
        } catch (error2) {
            console.error('❌ Alternative format also failed:', error2);
        }
    }

    await api.disconnect();
}

// Run if called directly
if (require.main === module) {
    sendDirectMessage().catch(console.error);
}
