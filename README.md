# Cross-Chain USDC Staking Platform

A decentralized cross-chain staking platform that allows users to deposit USDC on Ethereum, automatically bridge it to Vara Network as wUSDC, and earn 15% APY through automated staking with vwUSDC tokens.

## 🌟 Features

- **Cross-Chain Bridge**: Seamless USDC deposits from Ethereum to Vara
- **Automatic Staking**: Deposited USDC is automatically staked upon bridging
- **15% APY**: Competitive annual percentage yield on staked assets
- **swUSDC Tokens**: Receive liquid staking tokens representing your staked position
- **Real-time Rewards**: Continuous reward accrual with compound interest
- **Secure Escrow**: Funds are locked in audited smart contracts

## 🏗️ Architecture

### Components

1. **Ethereum Contracts** (`eth-depositor/`)
   - `MockUSDC.sol`: Test USDC token with faucet functionality
   - `CrossChainDepositor.sol`: Handles deposits and emits bridge events

2. **Vara Program** (`vara-staking/`)
   - `wusdc_token.rs`: Wrapped USDC token implementation
   - `staking_vault.rs`: Staking logic with 15% APY calculation
   - `lib.rs`: Main program orchestrating cross-chain deposits

3. **Relayer** (`relayer/`)
   - Listens for Ethereum deposit events
   - Generates cryptographic proofs
   - Submits transactions to Vara network

4. **Frontend** (`frontend/`)
   - Next.js application with modern UI
   - Wallet integration for both networks
   - Real-time balance and reward tracking

### Flow

```
1. User deposits USDC on Ethereum
   ↓
2. CrossChainDepositor emits DepositForStaking event
   ↓
3. Relayer detects event and generates proof
   ↓
4. Relayer submits proof to Vara bridge
   ↓
5. Vara program mints wUSDC and auto-stakes
   ↓
6. User receives swUSDC tokens earning 15% APY
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust toolchain with `wasm32-unknown-unknown` target
- MetaMask or compatible Ethereum wallet
- Polkadot.js extension for Vara

### 1. Deploy Ethereum Contracts

```bash
cd eth-depositor
npm install
npx hardhat compile

# Deploy to Holesky testnet
npx hardhat run scripts/deploy.js --network holesky
```

### 2. Build and Deploy Vara Program

```bash
cd vara-staking
cargo build --release --target wasm32-unknown-unknown

# Deploy using Gear Idea: https://idea.gear-tech.io/
# Upload the .wasm and .idl files
```

### 3. Configure and Start Relayer

```bash
cd relayer
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your contract addresses and keys

npm run dev
```

### 4. Launch Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 📋 Configuration

### Environment Variables

#### Relayer (`.env`)
```bash
# Ethereum
ETHEREUM_RPC_URL=wss://ethereum-holesky-rpc.publicnode.com
CROSS_CHAIN_DEPOSITOR_ADDRESS=0x...
MOCK_USDC_ADDRESS=0x...

# Vara
VARA_RPC_URL=wss://testnet.vara.network
VARA_MNEMONIC_KEY=your mnemonic here
STAKING_PROGRAM_ID=0x...

# Bridge (from Vara documentation)
CHECKPOINT_LIGHTH_CLIENT=0x...
HISTORICAL_PROXY_ID=0x...
```

#### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
NEXT_PUBLIC_DEPOSITOR_ADDRESS=0x...
NEXT_PUBLIC_STAKING_PROGRAM_ID=0x...
NEXT_PUBLIC_VARA_RPC_URL=wss://testnet.vara.network
```

## 🔧 Development

### Testing Ethereum Contracts

```bash
cd eth-depositor
npx hardhat test
```

### Building Vara Program

```bash
cd vara-staking
cargo test
cargo build --release
```

### Running Relayer in Development

```bash
cd relayer
npm run dev
```

## 📊 Staking Mechanics

### APY Calculation
- **Base APY**: 15% annually
- **Compounding**: Continuous (per block)
- **Formula**: `rewards = principal * (0.15 / seconds_per_year) * time_elapsed`

### Token Economics
- **wUSDC**: 1:1 backing with deposited USDC
- **swUSDC**: Liquid staking token representing staked position
- **Exchange Rate**: Dynamic based on accumulated rewards

### Rewards Distribution
- Rewards accrue automatically to the staking pool
- Users can unstake anytime to claim proportional rewards
- No lock-up periods or penalties

## 🔐 Security

### Smart Contract Security
- Reentrancy protection on all external calls
- Safe math operations to prevent overflow
- Access control for administrative functions

### Bridge Security
- Cryptographic proof verification
- Multi-relayer support for decentralization
- Finality requirements before processing

### Audit Status
⚠️ **This is a demonstration project. Do not use with real funds without proper audits.**

## 🛠️ Troubleshooting

### Common Issues

1. **Relayer not processing deposits**
   - Check Ethereum RPC connection
   - Verify contract addresses in config
   - Ensure sufficient gas in relayer wallet

2. **Frontend wallet connection issues**
   - Install MetaMask and Polkadot.js extensions
   - Switch to correct networks (Holesky/Vara testnet)
   - Check contract addresses in environment

3. **Vara program deployment fails**
   - Verify Rust toolchain and wasm target
   - Check program size limits
   - Ensure sufficient balance for deployment

## 📚 Resources

- [Vara Network Documentation](https://wiki.vara.network/)
- [Ethereum Bridge Guide](https://wiki.vara.network/docs/bridge)
- [Sails Framework](https://github.com/gear-tech/sails)
- [Gear Idea IDE](https://idea.gear-tech.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration project built for educational purposes. The smart contracts have not been audited and should not be used with real funds in production environments.
# deposit-front
