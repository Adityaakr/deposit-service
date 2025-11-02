// Get real data from latest Ethereum deposit
const { ethers } = require("hardhat");

async function getRealData() {
    console.log('🔍 Getting Real Data from Latest Ethereum Deposit...\n');
    
    const DEPOSITOR_ADDRESS = "0x34FF03fD5dad9E98C69Cf720C8c68cBF48be4855";
    
    // Connect to Hoodi
    const provider = new ethers.JsonRpcProvider("https://0xrpc.io/hoodi");
    
    // Get recent DepositForStaking events
    const depositorAbi = [
        "event DepositForStaking(address indexed user, uint256 amount, bytes32 indexed varaAddress)"
    ];
    
    const contract = new ethers.Contract(DEPOSITOR_ADDRESS, depositorAbi, provider);
    
    console.log('📡 Searching for recent DepositForStaking events...');
    
    // Get events from last 1000 blocks
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = currentBlock - 1000;
    
    console.log(`   Searching blocks ${fromBlock} to ${currentBlock}`);
    
    const events = await contract.queryFilter(
        contract.filters.DepositForStaking(),
        fromBlock,
        currentBlock
    );
    
    if (events.length === 0) {
        console.log('❌ No recent DepositForStaking events found');
        return;
    }
    
    // Get the latest event
    const latestEvent = events[events.length - 1];
    console.log(`✅ Found ${events.length} events, using latest:`);
    console.log('   TX Hash:', latestEvent.transactionHash);
    console.log('   Block:', latestEvent.blockNumber);
    console.log('   User:', latestEvent.args.user);
    console.log('   Amount:', ethers.formatUnits(latestEvent.args.amount, 6), 'USDC');
    console.log('   Vara Address:', latestEvent.args.varaAddress);
    
    // Get full transaction receipt
    const receipt = await provider.getTransactionReceipt(latestEvent.transactionHash);
    const block = await provider.getBlock(latestEvent.blockNumber);
    
    // Calculate slot
    const GENESIS_TIMESTAMP = 1600000000; // Approximate for Hoodi
    const calculatedSlot = Math.floor((block.timestamp - GENESIS_TIMESTAMP) / 12);
    
    console.log('\n📊 Real Blockchain Data:');
    console.log('   Block Number:', receipt.blockNumber);
    console.log('   Block Timestamp:', block.timestamp);
    console.log('   Transaction Index:', receipt.transactionIndex);
    console.log('   Calculated Slot:', calculatedSlot);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    
    // Create real receipt RLP data (simplified)
    const realReceiptData = {
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.hash,
        transactionIndex: receipt.transactionIndex,
        gasUsed: receipt.gasUsed.toString(),
        logs: receipt.logs.length,
        status: receipt.status
    };
    
    const receiptRlpBytes = ethers.toUtf8Bytes(JSON.stringify(realReceiptData));
    
    console.log('\n📋 Data for Vara Program Testing:');
    console.log('   Slot:', calculatedSlot);
    console.log('   Transaction Index:', receipt.transactionIndex);
    console.log('   Receipt RLP Length:', receiptRlpBytes.length);
    console.log('   Receipt Data:', JSON.stringify(realReceiptData, null, 2));
    
    // Save data for Vara testing
    const testData = {
        txHash: latestEvent.transactionHash,
        blockNumber: receipt.blockNumber,
        slot: calculatedSlot,
        transactionIndex: receipt.transactionIndex,
        receiptRlp: Array.from(receiptRlpBytes),
        user: latestEvent.args.user,
        amount: latestEvent.args.amount.toString(),
        varaAddress: latestEvent.args.varaAddress,
        timestamp: block.timestamp
    };
    
    console.log('\n💾 Test Data Object:');
    console.log(JSON.stringify(testData, null, 2));
    
    return testData;
}

getRealData()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
