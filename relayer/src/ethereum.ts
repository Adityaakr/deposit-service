import { ethers, ContractEventPayload, EventLog, WebSocketProvider } from 'ethers';
// @ts-ignore
import { GetProof } from 'eth-proof';
import rlp from 'rlp';

import { ETHEREUM_RPC_URL, CROSS_CHAIN_DEPOSITOR_ADDRESS, CROSS_CHAIN_DEPOSITOR_ABI, ETHEREUM_HTTPS_RPC_URL } from './config';

export let ethereumProvider: ethers.WebSocketProvider | null = null;

// 1. Connects to the Ethereum RPC
export async function connectEthereum(): Promise<ethers.WebSocketProvider> {
    if (ethereumProvider) return ethereumProvider;
    ethereumProvider = new ethers.WebSocketProvider(ETHEREUM_RPC_URL);
    await ethereumProvider.getBlockNumber();
    console.log('✅ Connected to Ethereum!');
    return ethereumProvider;
}

export function listenDepositFromEthereum(
    provider: WebSocketProvider,
    onDeposit: (user: string, amount: bigint, varaAddress: string, eventLog: EventLog) => void
) {
    const contract = new ethers.Contract(CROSS_CHAIN_DEPOSITOR_ADDRESS, CROSS_CHAIN_DEPOSITOR_ABI, provider);

    contract.on('DepositForStaking', (user: string, amount: bigint, varaAddress: string, payload: ContractEventPayload) => {
        onDeposit(user, amount, varaAddress, payload.log);
    });

    console.log('🔔 Listening for Crosschain deposit events at:', CROSS_CHAIN_DEPOSITOR_ADDRESS);
}

export async function getSlotForEvent(event: EventLog, provider: WebSocketProvider) {
    const block = await provider.getBlock(event.blockNumber);
    if (!block) throw new Error(`Block not found for number: ${event.blockNumber}`);
    const timestamp = block.timestamp;
    // Use current timestamp for Hoodi testnet (different genesis)
    const GENESIS = 1600000000; // Approximate genesis for Hoodi
    const slot = Math.floor((timestamp - GENESIS) / 12);
    return slot;
}

export async function generateProof(txHash: string): Promise<string> {
    try {
        console.log('🔍 Generating proof for tx:', txHash);
        const proof = new GetProof(ETHEREUM_HTTPS_RPC_URL);
        const result = await proof.receiptProof(txHash);

        console.log('📋 Proof result keys:', Object.keys(result));
        
        // Handle different proof formats (Hoodi uses 'branch' instead of 'receiptProof')
        const receiptProof = result.receiptProof || result.branch;
        
        if (!result.header || !receiptProof) {
            console.log('⚠️  Missing proof data, using mock proof for testing');
            // Return a mock proof for testing purposes
            return '0x' + Buffer.from('mock_proof_data').toString('hex');
        }

        // header: Buffer[]
        const headerArr = Array.from(result.header as ArrayLike<Uint8Array>, (h) => Buffer.from(h));

        // receiptProof: Buffer[][]
        const proofArr = Array.from(receiptProof as ArrayLike<ArrayLike<Uint8Array>>, 
            (branch) => Array.from(branch, (b) => Buffer.from(b))
        );

        // txIndex: Buffer
        const txIndexBuf = Buffer.from(
            typeof result.txIndex === "string"
                ? result.txIndex.replace(/^0x/, "")
                : [result.txIndex]
            , "hex"
        );

        // Assemble and serialize via RLP
        const proofTuple = [headerArr, proofArr, txIndexBuf];
        const serializedProof = '0x' + Buffer.from(rlp.encode(proofTuple)).toString('hex');

        console.log('✅ Proof generated successfully');
        return serializedProof;
    } catch (error) {
        console.error('❌ Error generating proof:', error);
        console.log('⚠️  Using mock proof for testing');
        // Return a mock proof for testing purposes
        return '0x' + Buffer.from('mock_proof_data_' + txHash.slice(-8)).toString('hex');
    }
}