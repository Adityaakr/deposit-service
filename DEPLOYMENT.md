# Deployment Guide

This guide walks you through deploying the complete cross-chain staking system from scratch.

## Prerequisites

- Node.js 18+ and npm
- Rust toolchain with `wasm32-unknown-unknown` target
- MetaMask wallet with Holesky ETH
- Polkadot.js extension
- Vara testnet tokens

## Step 1: Deploy Ethereum Contracts

### 1.1 Setup Environment

```bash
cd eth-depositor
npm install
```

### 1.2 Configure Network

Edit `hardhat.config.js` if needed, or set environment variables:

```bash
export ETHEREUM_RPC_URL="https://ethereum-holesky-rpc.publicnode.com"
export PRIVATE_KEY="your_ethereum_private_key_here"
```

### 1.3 Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Holesky testnet
npx hardhat run scripts/deploy.js --network holesky
```

**Save the output addresses** - you'll need them for the relayer and frontend.

Example output:
```
MockUSDC deployed to: 0x1234...
CrossChainDepositor deployed to: 0x5678...
```

### 1.4 Verify Contracts (Optional)

```bash
npx hardhat verify --network holesky 0x1234... # MockUSDC address
npx hardhat verify --network holesky 0x5678... 0x1234... # Depositor with USDC address
```

## Step 2: Build and Deploy Vara Program

### 2.1 Build the Program

```bash
cd vara-staking

# Install Rust target if not already installed
rustup target add wasm32-unknown-unknown

# Build optimized WASM
cargo build --release --target wasm32-unknown-unknown
```

### 2.2 Generate IDL

The build process should generate an IDL file. If not:

```bash
# The build.rs script should handle this automatically
cargo build
```

### 2.3 Deploy to Vara

1. Go to [Gear Idea](https://idea.gear-tech.io/)
2. Connect your Polkadot.js wallet
3. Switch to Vara testnet
4. Click "Upload Program"
5. Upload the `.wasm` file from `target/wasm32-unknown-unknown/release/`
6. Upload the generated `.idl` file
7. Initialize the program (call `new()`)
8. **Save the program ID** - you'll need it for the relayer

## Step 3: Get Bridge Contract Addresses

You need the official Vara bridge contract addresses:

### 3.1 Checkpoint Light Client

Find the current address at: https://wiki.vara.network/docs/bridge

### 3.2 Historical Proxy

Find the current address at: https://wiki.vara.network/docs/bridge

## Step 4: Configure and Deploy Relayer

### 4.1 Setup Environment

```bash
cd relayer
npm install
cp .env.example .env
```

### 4.2 Configure Environment Variables

Edit `.env` with your deployed contract addresses:

```bash
# Ethereum Configuration
ETHEREUM_RPC_URL=wss://ethereum-holesky-rpc.publicnode.com
ETHEREUM_HTTPS_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
CROSS_CHAIN_DEPOSITOR_ADDRESS=0x5678...  # From Step 1
MOCK_USDC_ADDRESS=0x1234...              # From Step 1

# Vara Configuration
VARA_RPC_URL=wss://testnet.vara.network
VARA_MNEMONIC_KEY=your twelve word mnemonic phrase here
STAKING_PROGRAM_ID=0xabcd...             # From Step 2

# Bridge Configuration (from Vara docs)
CHECKPOINT_LIGHTH_CLIENT=0x...           # Current bridge address
HISTORICAL_PROXY_ID=0x...                # Current bridge address
```

### 4.3 Fund Relayer Wallet

Your relayer wallet (from the mnemonic) needs Vara testnet tokens for gas fees.

### 4.4 Start Relayer

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Step 5: Deploy Frontend

### 5.1 Setup Environment

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

### 5.2 Configure Environment

Edit `.env.local`:

```bash
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x1234...     # From Step 1
NEXT_PUBLIC_DEPOSITOR_ADDRESS=0x5678...     # From Step 1
NEXT_PUBLIC_STAKING_PROGRAM_ID=0xabcd...    # From Step 2
NEXT_PUBLIC_VARA_RPC_URL=wss://testnet.vara.network
```

### 5.3 Start Frontend

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Step 6: Testing the System

### 6.1 Get Test Tokens

1. Visit your frontend at `http://localhost:3000`
2. Connect MetaMask (Holesky network)
3. Connect Polkadot.js (Vara testnet)
4. Click "Get Test USDC from Faucet"

### 6.2 Make a Test Deposit

1. Enter an amount to deposit
2. Click "Deposit & Stake"
3. Approve USDC spending in MetaMask
4. Confirm deposit transaction
5. Wait 15-20 minutes for bridge processing

### 6.3 Verify Results

After bridge processing:
- Check Vara wallet for wUSDC balance
- Check for swUSDC staking tokens
- Verify rewards are accruing

## Troubleshooting

### Relayer Issues

**Problem**: Relayer not detecting events
- Check Ethereum RPC connection
- Verify contract addresses
- Check event logs in Etherscan

**Problem**: Relayer can't submit to Vara
- Ensure relayer wallet has sufficient balance
- Check Vara RPC connection
- Verify program ID is correct

### Frontend Issues

**Problem**: Wallet connection fails
- Install required browser extensions
- Switch to correct networks
- Clear browser cache

**Problem**: Contract calls fail
- Check contract addresses in environment
- Verify network selection
- Check for sufficient balances

### Bridge Issues

**Problem**: Deposits not appearing on Vara
- Wait full 15-20 minutes for finalization
- Check relayer logs for errors
- Verify bridge contract addresses

## Monitoring

### Useful Commands

```bash
# Check relayer logs
cd relayer && npm run dev

# Check Ethereum transaction
# Visit: https://holesky.etherscan.io/tx/YOUR_TX_HASH

# Check Vara program state
# Visit: https://idea.gear-tech.io/programs/YOUR_PROGRAM_ID
```

### Health Checks

1. **Ethereum**: Contracts deployed and verified
2. **Vara**: Program deployed and initialized
3. **Relayer**: Running and processing events
4. **Frontend**: Accessible and wallet connections working

## Security Considerations

⚠️ **Important**: This is a demonstration system. For production:

1. Audit all smart contracts
2. Use secure key management
3. Implement proper monitoring
4. Add circuit breakers and limits
5. Test extensively on testnets

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review contract addresses and configuration
3. Verify network connections and balances
4. Check relayer logs for specific errors
