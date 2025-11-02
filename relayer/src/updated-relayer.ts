import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';
import { ethers } from 'ethers';

// Configuration for the updated relayer
const CONFIG = {
    // Ethereum
    ETHEREUM_RPC: 'wss://0xrpc.io/hoodi',
    ETHEREUM_HTTPS_RPC: 'https://0xrpc.io/hoodi',
    DEPOSITOR_ADDRESS: '0x34FF03fD5dad9E98C69Cf720C8c68cBF48be4855',
    PRIVATE_KEY: 'ec2180c5dfeaf12266daf34073e7de0c3a498014b2a35294e7bb7eb68ab3739a',
    
    // Vara - Updated with new program
    VARA_RPC: 'wss://testnet.vara.network',
    VARA_PROGRAM_ID: '0xf899328ec9d4e5cb2f4c97f06c3704d96ea2b59607c45c8114c53a101550ab76',
    VARA_MNEMONIC: 'fatal crouch original winter mail ladder decade version stomach foil pepper saddle'
};

const DEPOSITOR_ABI = [
    "event DepositForStaking(address indexed user, uint256 amount, bytes32 indexed varaAddress)"
];

let ethProvider: ethers.WebSocketProvider;
let varaApi: GearApi;
let varaAccount: any;

async function initializeConnections() {
    console.log('🔗 Initializing Relayer Connections...\n');
    
    // Connect to Ethereum
    try {
        ethProvider = new ethers.WebSocketProvider(CONFIG.ETHEREUM_RPC);
        await ethProvider.getBlockNumber();
        console.log('✅ Connected to Ethereum (Hoodi testnet)');
    } catch (error) {
        console.log('⚠️  WebSocket failed, using HTTP...');
        ethProvider = new ethers.JsonRpcProvider(CONFIG.ETHEREUM_HTTPS_RPC) as any;
        console.log('✅ Connected to Ethereum (HTTP)');
    }
    
    // Connect to Vara
    varaApi = await GearApi.create({ providerAddress: CONFIG.VARA_RPC });
    console.log('✅ Connected to Vara testnet');
    
    // Setup Vara wallet
    const keyring = new Keyring({ type: 'sr25519' });
    varaAccount = keyring.addFromMnemonic(CONFIG.VARA_MNEMONIC);
    console.log('✅ Vara wallet ready:', varaAccount.address);
    
    console.log('🎯 Target Program:', CONFIG.VARA_PROGRAM_ID);
    console.log('🔔 Listening for deposits at:', CONFIG.DEPOSITOR_ADDRESS);
}

async function calculateSlot(blockNumber: number): Promise<number> {
    const block = await ethProvider.getBlock(blockNumber);
    if (!block) throw new Error(`Block ${blockNumber} not found`);
    
    const GENESIS_TIMESTAMP = 1600000000; // Approximate for Hoodi
    const slot = Math.floor((block.timestamp - GENESIS_TIMESTAMP) / 12);
    return slot;
}

async function createReceiptData(txHash: string, blockNumber: number): Promise<number[]> {
    try {
        const receipt = await ethProvider.getTransactionReceipt(txHash);
        if (!receipt) {
            throw new Error('Receipt not found');
        }
        
        const receiptData = {
            blockNumber: receipt.blockNumber,
            transactionHash: receipt.hash,
            transactionIndex: receipt.index || 0,
            gasUsed: receipt.gasUsed.toString(),
            logs: receipt.logs.length,
            status: receipt.status
        };
        
        const receiptBytes = ethers.toUtf8Bytes(JSON.stringify(receiptData));
        return Array.from(receiptBytes);
    } catch (error) {
        console.log('⚠️  Using simplified receipt data');
        const simpleReceipt = { txHash, blockNumber, timestamp: Date.now() };
        const receiptBytes = ethers.toUtf8Bytes(JSON.stringify(simpleReceipt));
        return Array.from(receiptBytes);
    }
}

async function sendToVaraProgram(slot: number, transactionIndex: number, receiptRlp: number[], metadata: any) {
    console.log('📤 Sending to Vara program...');
    console.log('   Slot:', slot);
    console.log('   TX Index:', transactionIndex);
    console.log('   Receipt Length:', receiptRlp.length);
    console.log('   User:', metadata.user);
    console.log('   Amount:', metadata.amount, 'USDC');
    
    // Try the format that worked best in our tests
    const payload = {
        "DepositReceiver": {
            "SubmitReceipt": {
                "slot": slot,
                "transaction_index": transactionIndex,
                "receipt_rlp": receiptRlp
            }
        }
    };
    
    try {
        const message = varaApi.message.send({
            destination: CONFIG.VARA_PROGRAM_ID as `0x${string}`,
            payload: payload,
            gasLimit: 10000000000,
            value: 0
        });

        const result = await message.signAndSend(varaAccount);
        console.log('✅ Message sent to Vara program!');
        console.log('   Message ID:', result.toHex());
        console.log('   Check Vara Idea portal for processing status');
        
        return result.toHex();
    } catch (error: any) {
        console.error('❌ Failed to send to Vara:', error.message || error);
        throw error;
    }
}

async function handleDepositEvent(user: string, amount: bigint, varaAddress: string, event: any) {
    try {
        console.log('\n🟢 NEW DEPOSIT DETECTED!');
        console.log('   User:', user);
        console.log('   Amount:', ethers.formatUnits(amount, 6), 'USDC');
        console.log('   Vara Address:', varaAddress);
        console.log('   TX Hash:', event.transactionHash);
        console.log('   Block:', event.blockNumber);
        
        // Calculate slot
        const slot = await calculateSlot(event.blockNumber);
        console.log('   Calculated Slot:', slot);
        
        // Create receipt data
        const receiptRlp = await createReceiptData(event.transactionHash, event.blockNumber);
        
        // Send to Vara program
        const messageId = await sendToVaraProgram(
            slot,
            event.index || 0,
            receiptRlp,
            {
                user,
                amount: ethers.formatUnits(amount, 6),
                varaAddress,
                txHash: event.transactionHash
            }
        );
        
        console.log('🎉 Cross-chain relay completed!');
        console.log('   Ethereum TX:', event.transactionHash);
        console.log('   Vara Message:', messageId);
        console.log('   ─'.repeat(60));
        
    } catch (error: any) {
        console.error('❌ Error handling deposit:', error.message || error);
    }
}

async function startRelayer() {
    console.log('🚀 Starting Updated Cross-Chain Relayer...\n');
    
    await initializeConnections();
    
    // Create contract instance
    const contract = new ethers.Contract(CONFIG.DEPOSITOR_ADDRESS, DEPOSITOR_ABI, ethProvider);
    
    console.log('\n🔔 Listening for DepositForStaking events...');
    console.log('   Contract:', CONFIG.DEPOSITOR_ADDRESS);
    console.log('   Target Program:', CONFIG.VARA_PROGRAM_ID);
    console.log('   Ready to relay deposits to Vara!\n');
    
    // Listen for events
    contract.on('DepositForStaking', handleDepositEvent);
    
    // Also listen for past events from the last few blocks
    try {
        const currentBlock = await ethProvider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 100);
        
        console.log(`🔍 Checking for recent events (blocks ${fromBlock} to ${currentBlock})...`);
        
        const pastEvents = await contract.queryFilter(
            contract.filters.DepositForStaking(),
            fromBlock,
            currentBlock
        );
        
        if (pastEvents.length > 0) {
            console.log(`📋 Found ${pastEvents.length} recent events to process...`);
            
            for (const event of pastEvents) {
                const decoded = contract.interface.parseLog(event);
                if (decoded) {
                    console.log(`\n🔄 Processing recent event from block ${event.blockNumber}...`);
                    await handleDepositEvent(
                        decoded.args.user,
                        decoded.args.amount,
                        decoded.args.varaAddress,
                        event
                    );
                    
                    // Wait between processing to avoid spam
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        } else {
            console.log('📋 No recent events found');
        }
    } catch (error) {
        console.log('⚠️  Could not check past events:', error);
    }
    
    console.log('\n✅ Relayer is now running and monitoring for new deposits!');
    console.log('💡 Make a deposit on Ethereum to see the relayer in action...');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down relayer...');
    if (varaApi) {
        await varaApi.disconnect();
    }
    process.exit(0);
});

// Start the relayer
startRelayer().catch(error => {
    console.error('❌ Relayer failed to start:', error);
    process.exit(1);
});
