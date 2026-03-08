import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

import { contract, relayerWallet } from "./config.js";

import { checkSponsorship } from "../sponsorship/sponsorshipPolicy.mjs";

import {
  addToMempool,
  tryBuildBatch,
  getPool
} from "./sequencer/sequencer.js";

/* ------------------------------------------------ */
/*                   L2 STATE                       */
/* ------------------------------------------------ */

let balances = {};

let nonceBitmap = {};

let lastBatchSize = 0;

/* ------------------------------------------------ */
/*                EIP712 DOMAIN                     */
/* ------------------------------------------------ */

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

/* ------------------------------------------------ */
/*                VERIFY SIGNATURE                  */
/* ------------------------------------------------ */

export function verifyTx(tx, signature) {

  const recovered = ethers.verifyTypedData(
    domain,
    types,
    tx,
    signature
  );

  console.log("Recovered:", recovered);
  console.log("Expected :", tx.from);

  return recovered.toLowerCase() === tx.from.toLowerCase();
}

/* ------------------------------------------------ */
/*                NONCE BITMAP                      */
/* ------------------------------------------------ */

function useNonce(user, nonce) {

  if (!nonceBitmap[user]) {
    nonceBitmap[user] = {};
  }

  const bucket = nonce >> 8;

  const mask = 1 << (nonce & 255);

  const current =
    nonceBitmap[user][bucket] || 0;

  if ((current & mask) !== 0) {
    throw new Error("Nonce already used");
  }

  nonceBitmap[user][bucket] =
    current | mask;
}

/* ------------------------------------------------ */
/*                APPLY TX                          */
/* ------------------------------------------------ */

async function applyTx(tx) {

  const from = tx.from;

  const to = tx.to;

  const amount = BigInt(tx.amount);

  const nonce = Number(tx.nonce);

  useNonce(from, nonce);

  if (balances[from] === undefined) {

    const onchainBalance =
      await contract.balances(from);

    balances[from] =
      BigInt(onchainBalance.toString());
  }

  if (to !== from && balances[to] === undefined) {

    const onchainBalance =
      await contract.balances(to);

    balances[to] =
      BigInt(onchainBalance.toString());
  }

  console.log(
    "Balance before:",
    balances[from].toString(),
    "Transfer:",
    amount.toString()
  );

  if (balances[from] < amount) {
    throw new Error("Insufficient balance");
  }

  balances[from] -= amount;

  if (to !== from) {
    balances[to] += amount;
  }

  console.log(
    "Balance after:",
    balances[from].toString()
  );
}

/* ------------------------------------------------ */
/*                 MERKLE ROOT                      */
/* ------------------------------------------------ */

function buildTxRoot(txs) {

  const leaves = txs.map(tx =>
    ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address","address","uint256","uint256"],
        [tx.from, tx.to, tx.amount, tx.nonce]
      )
    )
  );

  const tree =
    new MerkleTree(leaves, keccak256, { sortPairs: true });

  return tree.getHexRoot();
}

/* ------------------------------------------------ */
/*                 STATE ROOT                       */
/* ------------------------------------------------ */

function computeStateRoot() {

  const leaves =
    Object.keys(balances).map(addr =>
      ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address","uint256"],
          [addr, balances[addr].toString()]
        )
      )
    );

  const tree =
    new MerkleTree(leaves, keccak256, { sortPairs: true });

  return tree.getHexRoot();
}

/* ------------------------------------------------ */
/*                RELAYER STAKE                     */
/* ------------------------------------------------ */

async function ensureStaked() {

  const bondRequired =
    await contract.RELAYER_BOND();

  const bonded =
    await contract.bonded(relayerWallet.address);

  if (bonded < bondRequired) {

    console.log("Staking relayer with:", bondRequired.toString());

    const tx =
      await contract.stake({
        value: bondRequired
      });

    await tx.wait();

    console.log("Relayer staked");
  }
}

/* ------------------------------------------------ */
/*                SUBMIT BATCH                      */
/* ------------------------------------------------ */

export async function submitBatch(txs) {

  await ensureStaked();

  for (let tx of txs) {
    await applyTx(tx);
  }

  const txRoot = buildTxRoot(txs);

  const stateRoot = computeStateRoot();

  console.log("Submitting batch...");
  console.log("TxRoot:", txRoot);
  console.log("StateRoot:", stateRoot);

  const txResponse =
    await contract.submitBatch(txRoot, stateRoot);

  await txResponse.wait();

  lastBatchSize = txs.length;

  for (let tx of txs) {
    await contract.recordSponsorship(tx.from);
  }

  console.log("Batch submitted to Sepolia");
}

/* ------------------------------------------------ */
/*             NEW TX ENTRY POINT                   */
/* ------------------------------------------------ */

export async function addTx(tx, signature) {

  if (!verifyTx(tx, signature)) {
    throw new Error("Invalid signature");
  }

  await checkSponsorship(tx);

  console.log("Gas sponsorship policy passed");

  addToMempool(tx);

  const batch = tryBuildBatch();

  if (batch) {
    await submitBatch(batch);
  }
}

/* ------------------------------------------------ */
/*             STATS FOR FRONTEND                   */
/* ------------------------------------------------ */

export function getStats() {

  return {
    mempoolSize: getPool().length,
    lastBatchSize
  };
}