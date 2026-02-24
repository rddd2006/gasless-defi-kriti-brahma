import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { contract, relayerWallet } from "./config.js";

/* ---------------- L2 STATE ---------------- */

let balances = {};
let nonces = {};
let txPool = [];

const BATCH_SIZE = 5;

/* ---------------- VERIFY EIP712 ---------------- */

const domain = {
  name: "OptimisticRollup",
  version: "1",
  chainId: 11155111,
  verifyingContract: process.env.CONTRACT_ADDRESS
};

const types = {
  L2Tx: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "uint256" }
  ]
};

export function verifyTx(tx, signature) {
  const recovered = ethers.verifyTypedData(domain, types, tx, signature);
  return recovered.toLowerCase() === tx.from.toLowerCase();
}

/* ---------------- APPLY TX ---------------- */

async function applyTx(tx) {

  const from = tx.from;
  const to = tx.to;
  const amount = BigInt(tx.amount);
  const nonce = Number(tx.nonce);

  // sync L1 balance if first time
  if (balances[from] === undefined) {
    const onchainBalance = await contract.balances(from);
    balances[from] = BigInt(onchainBalance.toString());
  }

  if (to !== from && balances[to] === undefined) {
    const onchainBalance = await contract.balances(to);
    balances[to] = BigInt(onchainBalance.toString());
  }

  if (nonces[from] === undefined) {
    nonces[from] = 0;
  }

  console.log(
    "Balance before:",
    balances[from].toString(),
    "Transfer:",
    amount.toString()
  );

  if (nonces[from] !== nonce) {
    throw new Error("Invalid nonce");
  }

  if (balances[from] < amount) {
    throw new Error("Insufficient balance");
  }

  balances[from] -= amount;

  if (to !== from) {
    balances[to] += amount;
  }

  nonces[from]++;

  console.log("Balance after:", balances[from].toString());
}

/* ---------------- MERKLE ROOTS ---------------- */

function buildTxRoot(txs) {
  const leaves = txs.map(tx =>
    ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address","address","uint256","uint256"],
        [tx.from, tx.to, tx.amount, tx.nonce]
      )
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getHexRoot();
}

function computeStateRoot() {
  const leaves = Object.keys(balances).map(addr =>
    ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address","uint256"],
        [addr, balances[addr].toString()]
      )
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getHexRoot();
}

/* ---------------- AUTO STAKE ---------------- */

async function ensureStaked() {
  const bondRequired = await contract.RELAYER_BOND();
  const bonded = await contract.bonded(relayerWallet.address);

  if (bonded < bondRequired) {
    console.log("Staking relayer with:", bondRequired.toString());

    const tx = await contract.stake({ value: bondRequired });
    await tx.wait();

    console.log("Relayer staked");
  }
}

/* ---------------- BATCH SUBMISSION ---------------- */

async function submitBatch(txs) {

  await ensureStaked();

  for (let tx of txs) {
    await applyTx(tx);
  }

  const txRoot = buildTxRoot(txs);
  const stateRoot = computeStateRoot();

  console.log("Submitting batch...");
  console.log("TxRoot:", txRoot);
  console.log("StateRoot:", stateRoot);

  const txResponse = await contract.submitBatch(txRoot, stateRoot);
  await txResponse.wait();

  console.log("Batch submitted to Sepolia");
}

/* ---------------- PUBLIC ENTRY ---------------- */

export async function addTx(tx, signature) {

  if (!verifyTx(tx, signature)) {
    throw new Error("Invalid signature");
  }

  txPool.push(tx);

  if (txPool.length >= BATCH_SIZE) {
    const batch = [...txPool];
    txPool = [];
    await submitBatch(batch);
  }
}