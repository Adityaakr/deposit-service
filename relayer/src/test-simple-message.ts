import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';
import { VARA_RPC_URL, STAKING_PROGRAM_ID, VARA_MNEMONIC_KEY } from './config';

export async function testSimpleMessage() {
    console.log('🧪 Testing Simplest Message Format...\n');
    
    const api = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara');

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
    console.log('✅ Wallet address:', account.address);

    try {
        // Try the absolute simplest format - just the parameters as an array
        const simplePayload = [13507287, 0, [1, 2, 3]];
        
        console.log('📡 Sending ultra-simple message...');
        console.log('Payload:', JSON.stringify(simplePayload));
        
        const message = api.message.send({
            destination: STAKING_PROGRAM_ID as `0x${string}`,
            payload: simplePayload,
            gasLimit: 10000000000,
            value: 0
        });

        const result = await message.signAndSend(account);
        console.log('✅ Simple message sent!');
        console.log('   - Message ID:', result.toHex());
        
        console.log('\n⏳ Waiting 5 seconds for processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n🎯 Check your Vara program now!');
        console.log('If this message also shows a red dot, we need to deploy the fixed program.');
        
    } catch (error: any) {
        console.error('❌ Simple message failed:', error.message || error);
    }

    await api.disconnect();
}

// Run if called directly
if (require.main === module) {
    testSimpleMessage().catch(console.error);
}
