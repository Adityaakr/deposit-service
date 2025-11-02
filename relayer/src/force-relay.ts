import { connectVara, sailsHistorical, sendToHistoricalProxy, connectWallet } from './vara';
import { connectEthereum, listenDepositFromEthereum, getSlotForEvent, generateProof } from './ethereum';
import { ethers } from 'ethers';
import { PingMessage } from './types';

let pingMessages: PingMessage[] = [];

async function forceRelay() {
    console.log('🚀 Force Relay - Testing Bridge Without Waiting for Checkpoints\n');
    
    // Connect to Vara and Ethereum
    await connectVara();
    const ethApi = await connectEthereum();
    const wallet = connectWallet();

    console.log('✅ Connected to both networks');

    // Listen for new deposits
    listenDepositFromEthereum(ethApi, async (user: string, amount: bigint, varaAddress: string, event: ethers.EventLog) => {
        const slot = await getSlotForEvent(event, ethApi);
        const proof: any = await generateProof(event.transactionHash);
        const msg: PingMessage = {
            from: user,
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            slot,
            proof,
        };
        pingMessages.push(msg);
        console.log('🟢 New deposit detected:', {
            user,
            amount: ethers.formatUnits(amount, 6) + ' USDC',
            varaAddress,
            slot,
            txHash: event.transactionHash
        });

        // Force send immediately without waiting for checkpoint
        console.log('\n🚀 FORCE SENDING - Not waiting for checkpoint!');
        try {
            await sendToHistoricalProxy(sailsHistorical, wallet, msg);
            console.log('✅ Message sent to Historical Proxy');
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    });

    // Also try to send any existing queued messages
    setTimeout(async () => {
        if (pingMessages.length > 0) {
            console.log('\n🔄 Attempting to send queued messages...');
            for (const msg of pingMessages) {
                try {
                    console.log(`📤 Sending message for slot ${msg.slot}...`);
                    await sendToHistoricalProxy(sailsHistorical, wallet, msg);
                    console.log('✅ Queued message sent successfully');
                } catch (error) {
                    console.error('❌ Error sending queued message:', error);
                }
            }
        } else {
            console.log('\n⚠️  No queued messages found');
            console.log('Make a new deposit to test the force relay');
        }
    }, 5000);

    console.log('\n🚀 Force Relay is running - will send messages immediately!');
    console.log('⚠️  This bypasses normal checkpoint waiting');
}

forceRelay().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});
