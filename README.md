Gas Optimizer Rollup (Batch Relayer + Explorer)

A lightweight Ethereum gas optimization system that batches multiple user transactions off-chain and submits them as a single aggregated transaction on L1, significantly reducing gas costs.

The project demonstrates core ideas used in Layer 2 rollups such as:

transaction batching

relayers

aggregated signatures

off-chain execution

on-chain settlement

rollup explorers

📌 Features
⚡ Gas Optimization

Multiple user transactions are batched together and executed as a single L1 transaction, reducing gas costs per user.

🔗 Relayer Architecture

Users submit transactions without paying gas directly. A relayer collects them and submits them on-chain.

📦 Transaction Batching

Transactions are stored in a mempool and periodically grouped into a batch.

✍️ BLS Signature Aggregation

All user signatures are aggregated into a single signature, drastically reducing verification cost.

📊 Rollup Explorer

A frontend dashboard that allows users to:

View submitted transactions

View batch history

View rollup state roots

Compare L1 vs batched gas usage

🧾 Transaction History

Users can track transactions across batches.

🏗 Project Architecture
Gas Optimizer Rollup
│
├── contracts/               # Smart contracts (Foundry)
│
├── relayer/                 # Off-chain batching service
│   ├── server.js
│   ├── batcher.js
│   ├── mempool.js
│   ├── executor.js
│   ├── bls/
│   │     └── blsSigner.js
│   └── db/
│         └── storage.js
│
├──rollup  explorer/                # Frontend dashboard (React)
│   ├── pages/
│   ├── components/
│   
│
├── scripts/
│
└── README.md
⚙️ System Workflow
installation guide 
Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

Verify installation:

forge --version

Navigate to the contracts directory:

cd contracts

Install dependencies:

forge install

Compile contracts:

forge build
🚀 Deploy Smart Contracts

Create a .env file inside contracts:

PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

Deploy contract:

forge script script/Deploy.s.sol \
--rpc-url $RPC_URL \
--private-key $PRIVATE_KEY \
--broadcast

Copy the deployed contract address for later use.

🔧 Install and Run Relayer

Navigate to relayer folder:

cd ../relayer

Install dependencies:

npm install

Important packages include:

express

ethers

dotenv

cors

@noble/bls12-381

Configure Environment
####(NAME THE root FILE AS gasless-rollup)####
Create .env inside project:

RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=RELAYER_PRIVATE_KEY
CONTRACT_ADDRESS=DEPLOYED_CONTRACT_ADDRESS
PORT=4000
Start Relayer
node server.js

You should see something like:

Relayer server running on port 4000
Batcher started

Server URL:

http://localhost:4000
🎨 Install and Run Explorer

Navigate to frontend:

cd ../rollup-explorer-main

Install dependencies:

npm install

Run development server:

npm run dev

Open browser:

http://localhost:8080 (note frontend folder is for testing only (rollup main is the real frontend))
DOCKER 
cd /home/riddhith/gasless-rollup

docker compose down -v
docker compose up -d
docker compose ps
docker compose logs --tail 30
docker compose exec gasless-rollup bash

cd /workspace
ls

forge build

cd relayer/
node server.js

cd ..
(make sure to change contract address to the contract address of deploy)




forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

cd rollup-explorer-main/





npm i
NPM RUN DEV
HOW TO TEST 
AFTER RELAYER AND FRONTEND ARE WORKING CONNECT WALLET IN SEND PAGE AND THEN SEND PAGE AND THE IN RELAYER LOGS YOU WILL SEE THAT AFTER 5 TRANSACTIONS BATCH IS SUBMITTED TO SEPOLIA
The full transaction lifecycle works as follows:

User
  │
  │ submit transaction
  ▼
Relayer API
  │
  │ store tx in mempool
  ▼
Batcher
  │
  │ group transactions
  ▼
BLS Aggregator
  │
  │ aggregate signatures
  ▼
Batch Executor
  │
  │ submit batch
  ▼
Ethereum L1
  │
  │ store batch
  ▼
Explorer UI
🧩 Core Components
1️⃣ Smart Contracts

Responsible for:

storing batches

verifying aggregated signatures

updating rollup state

Main contract functionality:

submitBatch()
verifySignature()
updateStateRoot()
2️⃣ Relayer

The relayer is the core off-chain service.

Responsibilities:

receive user transactions

maintain mempool

batch transactions

aggregate BLS signatures

submit batches on-chain

Main modules:

server.js

REST API server.

Example endpoints:

POST /submitTx
GET /pendingTx
GET /batches
GET /tx/:hash
mempool.js

Stores pending transactions before batching.

addTransaction()
getPendingTransactions()
clearMempool()
batcher.js

Groups transactions into batches.

createBatch()
calculateTxRoot()
generateStateRoot()
executor.js

Submits the batch to Ethereum.

submitBatchToL1()
estimateGas()
sendTransaction()
blsSigner.js

Handles BLS aggregation.

signMessage()
aggregateSignatures()
verifyAggregate()

Uses:

@noble/bls12-381
3️⃣ Explorer (Frontend)

A React dashboard for viewing rollup activity.

Pages include:

Dashboard
Transactions
Batches
Gas Analytics
Batch Details

Features:

view transaction history

inspect batches

compare L1 vs batched gas usage

visualize batching efficiency

🧪 How To Run Locally
1️⃣ Clone Repository
git clone https://github.com/YOUR_REPO.git
cd YOUR_REPO
🔧 Setup Relayer
cd relayer
npm install

Install dependencies:

npm install express ethers dotenv cors @noble/bls12-381

Create environment file:

.env

Example:

RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=RELAYER_PRIVATE_KEY
CONTRACT_ADDRESS=ROLLUP_CONTRACT
PORT=4000

Start relayer:

node server.js

Server runs at:

http://localhost:4000
🎨 Run Explorer
cd explorer
npm install
npm run dev

Open:

http://localhost:3000
📡 API Endpoints
Submit Transaction
POST /submitTx

Body:

{
  "to": "0x...",
  "amount": 1
}
View Pending Transactions
GET /pendingTx
View All Batches
GET /batches
Transaction Details
GET /tx/:hash
📊 Gas Savings Calculation

Gas savings are computed by comparing:

Individual L1 Transactions
vs
Single Batched Transaction

Formula:

Savings = (L1 Gas * N) - Batch Gas

Example:

10 individual tx: 21000 * 10 = 210000 gas

1 batch tx: 60000 gas

Savings = 150000 gas
📈 Explorer Metrics

The dashboard visualizes:

Total batches

Total transactions

Average batch size

Gas saved

L1 vs Rollup cost comparison

Charts include:

Gas Savings Over Time
Batch Size Distribution
Transaction Volume
🔬 Testing The System
Test Transaction Flow

1️⃣ Start relayer

node server.js

2️⃣ Submit transactions

curl -X POST http://localhost:4000/submitTx \
-H "Content-Type: application/json" \
-d '{"to":"0x123","amount":1}'

3️⃣ Wait for batching interval

Batcher will automatically create a batch.

4️⃣ Check batches

GET /batches
Test Signature Aggregation

Run test script:

node tests/blsTest.js

This verifies:

signature generation

aggregation

verification

Test Gas Savings

Compare:

etherscan L1 tx cost
vs
batch tx cost

Explorer graphs display savings.

🛠 Tech Stack
Backend

Node.js

Express

Ethers.js

BLS cryptography

Smart Contracts

Solidity

Foundry

Frontend

React

Tailwind

Chart.js / Recharts

Blockchain

Ethereum

Sepolia testnet

🔐 Security Considerations

Potential attack vectors:

relayer censorship

batch manipulation

signature forgery

replay attacks

Mitigations:

signature verification

batch hash commitments

challenge windows (future work)

🚧 Future Improvements

fraud proofs

optimistic rollup challenge system

zk proofs for batches

decentralized relayers

MEV protection

EIP-4337 account abstraction integration

📚 Learning Goals

This project demonstrates:

Layer 2 rollup fundamentals

batching systems

off-chain computation

relayer architectures

signature aggregation

gas optimization techniques