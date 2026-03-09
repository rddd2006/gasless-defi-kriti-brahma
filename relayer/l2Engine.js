import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

import { contract, relayerWallet } from "./config.js";
import { checkSponsorship } from "../sponsorship/sponsorshipPolicy.mjs";
import { addToMempool, buildBatch } from "./sequencer/sequencer.js";
import { compressBatch } from "./compression/compress.js";
import { signBatch } from "./bls/blsSigner.js";

/* ---------------- L2 STATE ---------------- */

let balances = {};
let nonces = {};

const batchTrees = {};
let batchIdCounter = 0;

/* ---------------- EIP712 DOMAIN ---------------- */

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

/* ---------------- VERIFY SIGNATURE ---------------- */

export function verifyTx(tx, signature) {

  const recovered = ethers.verifyTypedData(domain, types, tx, signature);

  if (recovered.toLowerCase() !== tx.from.toLowerCase()) {
    throw new Error("Invalid signature");
  }

  return true;
}

/* ---------------- APPLY TX ---------------- */

async function applyTx(tx) {

  const from = tx.from;
  const to = tx.to;

  const amount = BigInt(tx.amount);
  const nonce = Number(tx.nonce);

  if (balances[from] === undefined) {
    const onchainBalance = await contract.balances(from);
    balances[from] = BigInt(onchainBalance.toString());
  }

  if (balances[to] === undefined) {
    const onchainBalance = await contract.balances(to);
    balances[to] = BigInt(onchainBalance.toString());
  }

  if (nonces[from] === undefined) {
    nonces[from] = 0;
  }

  if (nonces[from] !== nonce) {
    throw new Error("Invalid nonce");
  }

  if (balances[from] < amount) {
    throw new Error("Insufficient balance");
  }

  balances[from] -= amount;
  balances[to] += amount;

  nonces[from]++;
}

/* ---------------- MERKLE TREE ---------------- */

function buildMerkleTree(txs) {

  const leaves = txs.map(tx =>
    ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address","address","uint256","uint256"],
        [tx.from, tx.to, tx.amount, tx.nonce]
      )
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  return {
    tree,
    root: tree.getHexRoot(),
    leaves
  };
}

/* ---------------- STATE ROOT ---------------- */

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

/* ---------------- STAKE RELAYER ---------------- */

async function ensureStaked() {

  const bondRequired = await contract.RELAYER_BOND();
  const bonded = await contract.bonded(relayerWallet.address);

  if (bonded < bondRequired) {

    const tx = await contract.stake({
      value: bondRequired
    });

    await tx.wait();

    console.log("Relayer staked");
  }
}

/* ---------------- SUBMIT BATCH ---------------- */

async function submitBatch(txs) {

  await ensureStaked();

  for (const tx of txs) {
    await applyTx(tx);
  }

  /* CALDATA COMPRESSION */

  const compressed = compressBatch(txs);

  const txRoot = ethers.keccak256(compressed);

  const { tree } = buildMerkleTree(txs);

  const stateRoot = computeStateRoot();

  /* BLS SIGN BATCH ROOT */

  const blsSignature = await signBatch(txRoot);

  console.log("Submitting batch...");
  console.log("TxRoot:", txRoot);
  console.log("BLS Signature:", blsSignature);

  const txResponse = await contract.submitBatch(
    txRoot,
    stateRoot,
    blsSignature
  );

  await txResponse.wait();

  batchTrees[batchIdCounter] = tree;

  batchIdCounter++;

  for (const tx of txs) {
    await contract.recordSponsorship(tx.from);
  }

  console.log("Batch submitted to Sepolia");
}

/* ---------------- GENERATE MERKLE PROOF ---------------- */

export function getProof(batchId, tx) {

  const tree = batchTrees[batchId];

  if (!tree) {
    throw new Error("Batch not found");
  }

  const leaf = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address","address","uint256","uint256"],
      [tx.from, tx.to, tx.amount, tx.nonce]
    )
  );

  return tree.getHexProof(leaf);
}

/* ---------------- PUBLIC ENTRY ---------------- */

export async function addTx(tx, signature) {

  verifyTx(tx, signature);

  await checkSponsorship(tx);

  addToMempool(tx);

  const batch = buildBatch();

  if (batch) {
    await submitBatch(batch);
  }
}