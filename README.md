<div align="center">

# ⛽ Gasless DeFi — Optimistic Rollup with Gasless Transactions

**A lightweight Ethereum Layer 2 system that batches user transactions off-chain and submits them as a single aggregated transaction on L1, slashing gas costs significantly.**

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built_with-Foundry-FFDB1C?logo=ethereum)](https://book.getfoundry.sh/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Network](https://img.shields.io/badge/Testnet-Sepolia-7B3FE4?logo=ethereum)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Docker Deployment](#-docker-deployment)
- [API Reference](#-api-reference)
- [Smart Contracts](#-smart-contracts)
- [How It Works](#-how-it-works)
- [Gas Savings](#-gas-savings)
- [Testing](#-testing)
- [Tech Stack](#-tech-stack)
- [Security Considerations](#-security-considerations)
- [Future Roadmap](#-future-roadmap)
- [License](#-license)

---

## Overview

Gasless DeFi demonstrates core Layer 2 rollup concepts in a production-style architecture. Users submit EIP-712 signed meta-transactions to an off-chain relayer, which collects them in a mempool, batches every 5 transactions, compresses calldata, aggregates BLS signatures, builds Merkle trees for fraud proofs, and settles the batch on Ethereum L1 — all without requiring users to hold ETH for gas.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **⚡ Gasless Transactions** | Users sign EIP-712 typed data off-chain; the relayer pays gas on their behalf |
| **📦 Transaction Batching** | Every 5 transactions are grouped into a single L1 submission |
| **🔐 BLS Signature Aggregation** | Batch signatures are aggregated using BLS12-381 for verification efficiency |
| **🗜️ Calldata Compression** | Transactions are tightly packed with `solidityPacked` to minimize on-chain storage |
| **🌳 Merkle Proof Fraud System** | Each batch commits a Merkle root, enabling on-chain fraud challenges with proofs |
| **⏱️ Challenge Window** | 55-minute optimistic finalization period for dispute resolution |
| **💰 Gas Sponsorship** | On-chain sponsorship policy with daily limits and whitelisted targets |
| **📊 Rollup Explorer** | Full-featured React dashboard with gas analytics, batch history, and wallet integration |
| **🐳 Docker Support** | One-command containerized development environment |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                           │
│  Connect Wallet → Sign EIP-712 Typed Data → Submit to Relayer    │
└──────────────────────┬───────────────────────────────────────────┘
                       │  POST /submit { tx, signature }
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      RELAYER (Node.js)                           │
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────────────┐  │
│  │   server.js  │──▶│  l2Engine   │──▶│  Sequencer (mempool)  │  │
│  │  (Express)   │   │ (verify +   │   │  MAX_BATCH = 5 txs    │  │
│  └─────────────┘   │  apply tx)  │   └──────────┬────────────┘  │
│                     └─────────────┘              │               │
│                                          batch ready?            │
│                                                  │               │
│                     ┌────────────────────────────▼─────────────┐ │
│                     │         Batch Pipeline                   │ │
│                     │  1. Compress calldata (solidityPacked)   │ │
│                     │  2. Build Merkle tree (txRoot)           │ │
│                     │  3. Compute new state root               │ │
│                     │  4. BLS-sign batch (bls12-381)           │ │
│                     └────────────────────────────┬─────────────┘ │
└──────────────────────────────────────────────────┼───────────────┘
                                                   │
                       submitBatch(txRoot, stateRoot, blsSig)
                                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                   ETHEREUM L1 (Sepolia)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              OptimisticRollup.sol                         │    │
│  │                                                          │    │
│  │  • submitBatch()      — store batch + BLS sig            │    │
│  │  • challengeTx()      — fraud proof with Merkle proof    │    │
│  │  • finalizeBatch()    — after 55-min challenge window    │    │
│  │  • deposit() / stake() — user deposits + relayer bonds   │    │
│  │  • Sponsorship Policy — daily limits + whitelisting      │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                                                   │
                          events + state queries   │
                                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                  ROLLUP EXPLORER (React + Vite)                   │
│                                                                  │
│  Pages: Overview │ Send │ Deposit │ Batches │ Mempool            │
│         Gas Analytics │ History │ Challenge │ Sponsorship         │
│                                                                  │
│  • Wallet connection (MetaMask)                                  │
│  • Real-time batch & transaction data                            │
│  • L1 vs Rollup gas cost comparison charts (Recharts)            │
│  • Fraud proof challenge submission                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
gasless-defi/
├── src/                            # Solidity smart contracts
│   ├── OptimisticRollup.sol        # Core rollup (batching, fraud proofs, sponsorship)
│   ├── EIP712MetaTx.sol            # Abstract EIP-712 typed data helper
│   └── MerkleLib.sol               # Merkle proof verification library
│
├── script/
│   └── Deploy.s.sol                # Foundry deployment script
│
├── test/
│   └── Rollup.t.sol                # Gas comparison tests (individual vs batched)
│
├── relayer/                        # Off-chain relayer service
│   ├── server.js                   # Express REST API (submit, challenge, stats)
│   ├── l2Engine.js                 # L2 state machine (verify, apply, batch, submit)
│   ├── config.js                   # Ethers.js provider + contract setup
│   ├── sequencer/
│   │   └── sequencer.js            # Mempool manager + batch builder (5-tx threshold)
│   ├── bls/
│   │   ├── blsSigner.js            # BLS12-381 batch signing
│   │   └── blsAggregator.js        # Signature aggregation utilities
│   └── compression/
│       └── compress.js             # Calldata packing with solidityPacked
│
├── sponsorship/                    # Gas sponsorship module
│   ├── SponsorshipPolicy.sol       # On-chain sponsorship with daily limits
│   ├── SponsorshipVerifier.sol     # Verification helper
│   ├── sponsorshipPolicy.mjs       # Off-chain eligibility checks
│   └── paymasterSigner.js          # Paymaster signing utilities
│
├── rollup-explorer-main/           # Frontend dashboard (React + Vite + TypeScript)
│   └── src/pages/
│       ├── Overview.tsx            # Dashboard with rollup stats
│       ├── SendPage.tsx            # Submit gasless transactions
│       ├── DepositPage.tsx         # Deposit ETH to L2
│       ├── BatchesPage.tsx         # Browse submitted batches
│       ├── MempoolPage.tsx         # View pending transactions
│       ├── GasAnalytics.tsx        # L1 vs rollup cost charts
│       ├── HistoryPage.tsx         # Transaction history
│       ├── ChallengePage.tsx       # Submit fraud proof challenges
│       ├── SponsorshipPage.tsx     # Sponsorship status
│       └── WalletPage.tsx          # Wallet management
│
├── frontend/                       # Lightweight test frontend
│   └── index.html
│
├── Dockerfile                      # Dev container (Node 20 + Foundry)
├── docker-compose.yml              # Container orchestration
├── foundry.toml                    # Foundry configuration
├── package.json                    # Root scripts & workspace config
├── vercel.json                     # Vercel deployment config
├── railway.toml                    # Railway deployment config
└── .env.example                    # Environment variable template
```

---

## 📝 Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20+ | Relayer & frontend runtime |
| [Foundry](https://book.getfoundry.sh/) | latest | Smart contract compilation, testing, deployment |
| [Git](https://git-scm.com/) | 2.x | Version control + submodules |
| [MetaMask](https://metamask.io/) | — | Wallet for signing transactions |
| [Docker](https://www.docker.com/) | — | *(Optional)* Containerized setup |

You will also need **Sepolia testnet ETH** — get some from the [Sepolia Faucet](https://sepoliafaucet.com/).

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/gasless-defi.git
cd gasless-defi

# Initialize submodules (OpenZeppelin, forge-std)
git submodule update --init --recursive
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Sepolia RPC (Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Deployer / Relayer private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# BLS signing key for batch aggregation
BLS_PRIVATE_KEY=your_bls_private_key

# After deployment — paste your contract address here
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Frontend
VITE_CONTRACT_ADDRESS=0x...same_as_above
VITE_BACKEND_URL=http://localhost:4000
CORS_ALLOWED_ORIGIN=http://localhost:8080

# Optional
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Compile & Deploy Contracts

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install Solidity dependencies
forge install

# Compile
forge build

# Deploy to Sepolia
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

> **📌 Important:** Copy the deployed contract address from the output and update `CONTRACT_ADDRESS` and `VITE_CONTRACT_ADDRESS` in your `.env` file.

### 4. Run the Relayer

```bash
cd relayer
npm install
node server.js
```

The relayer starts on **http://localhost:4000**. You should see:

```
Relayer running on port 4000
```

### 5. Run the Explorer Frontend

```bash
cd rollup-explorer-main
npm install
npm run dev
```

The explorer opens on **http://localhost:8080**.

> **Tip:** You can also run both simultaneously from the project root:
>
> ```bash
> npm install        # install root devDependencies (concurrently)
> npm run start:all  # starts relayer + frontend together
> ```

---

## 🐳 Docker Deployment

For a fully containerized development environment:

```bash
# Build and start the container
docker compose up -d --build

# Verify it is running
docker compose ps

# Access the container shell
docker compose exec gasless-rollup bash
```

Inside the container:

```bash
# Compile contracts
forge build

# Deploy contracts
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Start relayer (background)
cd relayer && node server.js &

# Start frontend
cd /workspace/rollup-explorer-main && npm run dev
```

Management commands:

```bash
# View logs
docker compose logs -f

# Stop everything
docker compose down

# Full cleanup
docker compose down -v && docker rmi gasless-rollup
```

**Exposed Ports:**

| Port | Service |
|---|---|
| `4000` | Relayer API |
| `8080` | Explorer Frontend |

---

## 📡 API Reference

All endpoints are served from the relayer at `http://localhost:4000`.

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/submit` | Submit a signed transaction |
| `GET` | `/nonce/:address` | Get current nonce for an address |
| `GET` | `/transactions/:address` | Get transaction history for an address |

#### Submit Transaction — `POST /submit`

```json
{
  "tx": {
    "from": "0xYourAddress",
    "to": "0xRecipientAddress",
    "amount": "1000000000000000000",
    "nonce": 0
  },
  "signature": "0x..."
}
```

The `signature` must be a valid EIP-712 typed data signature over the `L2Tx` struct.

### Batches & State

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/batches` | List all submitted batches |
| `GET` | `/mempool` | View pending transactions in the mempool |
| `GET` | `/stats` | Rollup statistics (total batches, gas metrics, compression) |

#### Stats Response Example

```json
{
  "totalBatches": 12,
  "totalTx": 60,
  "mempoolSize": 3,
  "avgGasPerTx": 2800,
  "batchGas": 94000,
  "compressedBytes": 260,
  "uncompressedBytes": 640
}
```

### Fraud Proofs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/challenge` | Challenge a specific transaction in a batch |

```json
{
  "batchId": 0,
  "txIndex": 2
}
```

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Returns `"Relayer Alive"` |

---

## 📜 Smart Contracts

### OptimisticRollup.sol

The core contract deployed on Sepolia. Key functions:

| Function | Description |
|---|---|
| `deposit()` | Users deposit ETH to their L2 balance |
| `stake()` | Relayers post a bond (0.001 ETH minimum) |
| `submitBatch(txRoot, stateRoot, sig)` | Submit a batch with Merkle root + BLS signature |
| `challengeTx(batchId, tx, sig, proof)` | Challenge a transaction with a Merkle proof |
| `finalizeBatch(batchId)` | Finalize a batch after the 55-min challenge window |
| `isEligibleForSponsorship(user, target)` | Check if a user qualifies for gas sponsorship |
| `toggleWhitelist(target, status)` | Owner: whitelist/delist targets for sponsorship |

### Contract Constants

| Constant | Value | Description |
|---|---|---|
| `CHALLENGE_WINDOW` | 55 minutes | Time window for fraud proof disputes |
| `RELAYER_BOND` | 0.001 ETH | Minimum bond for relayers |
| `DAILY_LIMIT` | 5 | Max sponsored transactions per user per day |

---

## ⚙️ How It Works

```
 1. SIGN        User signs an EIP-712 typed L2Tx in their wallet (no gas needed)
                     │
 2. SUBMIT      Signed tx is sent to the relayer via POST /submit
                     │
 3. VERIFY      Relayer verifies the EIP-712 signature matches tx.from
                     │
 4. SEQUENCE    Transaction is added to the mempool (sequencer orders by arrival)
                     │
 5. BATCH       When 5 txs accumulate, the sequencer builds a batch
                     │
 6. COMPRESS    Batch calldata is tightly packed via solidityPacked
                     │
 7. MERKLE      A Merkle tree is built from all txs → txRoot
                     │
 8. STATE       New state root is computed from updated L2 balances
                     │
 9. BLS SIGN    The batch txRoot is signed with BLS12-381
                     │
10. SETTLE      Relayer calls submitBatch(txRoot, stateRoot, blsSig) on L1
                     │
11. CHALLENGE   Anyone can challenge within 55 minutes using Merkle proofs
                     │
12. FINALIZE    After the window, finalizeBatch() commits the new state root
```

---

## 💰 Gas Savings

Gas savings are computed by comparing individual L1 transactions against batched submissions:

```
Savings = (Individual Gas x N) - Batch Gas
```

| Scenario | Gas Cost | Savings |
|---|---|---|
| 5 individual L1 transfers | 5 x 21,000 = **105,000 gas** | — |
| 1 batched submission (5 txs) | ~**94,000 gas** | **~10.5%** |
| 10 individual L1 transfers | 10 x 21,000 = **210,000 gas** | — |
| 2 batched submissions (10 txs) | ~**188,000 gas** | **~10.5%** |

> **Note:** Real-world savings scale better with more complex transactions (token transfers, DeFi interactions) where individual gas costs are much higher than simple ETH transfers.

The **Gas Analytics** page in the explorer visualizes these comparisons with interactive charts.

---

## 🧪 Testing

### Smart Contract Tests (Foundry)

```bash
# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testSubmitBatchGas -vvv
```

The test suite includes:

- `testGasDirectDeposit` — Gas cost of a single deposit
- `testSubmitBatchGas` — Gas cost of submitting a batch
- `testFiveDirectDepositsGas` — Gas for 5 individual deposits
- `testBatchExecutionGas` — Gas for 1 batch vs 5 individual txs

### End-to-End Testing

1. Start the relayer and frontend
2. Open the explorer at **http://localhost:8080**
3. Connect your MetaMask wallet (Sepolia network)
4. Deposit ETH via the **Deposit** page
5. Send transactions from the **Send** page
6. After 5 transactions, observe in the relayer logs that a batch is submitted to Sepolia
7. View batch details on the **Batches** page
8. Analyze gas savings on the **Gas Analytics** page

### Quick Test via cURL

```bash
# Submit a transaction
curl -X POST http://localhost:4000/submit \
  -H "Content-Type: application/json" \
  -d '{"tx":{"from":"0xYourAddress","to":"0xRecipient","amount":"1000000000000000000","nonce":0},"signature":"0x..."}'

# Check stats
curl http://localhost:4000/stats

# View batches
curl http://localhost:4000/batches
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contracts** | Solidity ^0.8.20, OpenZeppelin (ECDSA, MerkleProof) |
| **Build & Test** | Foundry (Forge, Cast, Anvil) |
| **Relayer** | Node.js 20+, Express 5, Ethers.js v6 |
| **Cryptography** | BLS12-381 (`@noble/bls12-381`), EIP-712 typed data |
| **Data Structures** | Merkle Trees (`merkletreejs`), Nonce Bitmaps |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Charts** | Recharts |
| **Blockchain** | Ethereum Sepolia Testnet |
| **Containerization** | Docker, Docker Compose |
| **Deployment** | Vercel (frontend), Railway (relayer) |

---

## 🔐 Security Considerations

| Risk | Mitigation |
|---|---|
| **Relayer censorship** | Decentralized relayer network planned; users can self-submit in emergencies |
| **Batch manipulation** | Merkle root commitments ensure batch integrity |
| **Signature forgery** | EIP-712 typed data + ECDSA recovery validates every transaction |
| **Replay attacks** | Nonce bitmap prevents double-spending; domain separator binds to chain + contract |
| **Relayer misbehavior** | Relayer bond (0.001 ETH) at risk; slashing via fraud proofs |
| **State corruption** | Challenge window allows anyone to dispute invalid state transitions |

> **⚠️ Disclaimer:** This is an educational project demonstrating rollup concepts. It has not been audited and should not be used in production with real funds.

---

## 🚧 Future Roadmap

- [ ] **Fraud proofs** — Full interactive fraud proof protocol
- [ ] **ZK proofs** — Replace optimistic model with zero-knowledge validity proofs
- [ ] **Decentralized relayers** — Multiple competing relayers with on-chain selection
- [ ] **MEV protection** — Fair ordering and encrypted mempool
- [ ] **EIP-4337 integration** — Account abstraction for native smart wallet support
- [ ] **Data availability** — EIP-4844 blob transactions for cheaper data posting
- [ ] **Cross-rollup bridging** — Interoperability with other L2 networks
- [ ] **Token support** — ERC-20 and ERC-721 transfer batching

---

## 📚 Learning Goals

This project demonstrates:

- Layer 2 rollup fundamentals
- Transaction batching systems
- Off-chain computation with on-chain settlement
- Relayer architectures
- BLS signature aggregation
- Gas optimization techniques
- Optimistic fraud proof mechanisms

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for Ethereum scalability research**

</div>
