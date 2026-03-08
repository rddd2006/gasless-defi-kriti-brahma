import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { aggregateSignatures } from "./bls.js";

/* ------------------------------------------------ */
/*                 TX ROOT                          */
/* ------------------------------------------------ */

export function buildTxRoot(txs) {

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

export function computeStateRoot(balances) {

  const leaves = Object.keys(balances).map(addr =>
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
/*               BUILD COMPLETE BATCH               */
/* ------------------------------------------------ */

export async function buildBatch(txs, balances, signatures) {

  const txRoot = buildTxRoot(txs);

  const stateRoot = computeStateRoot(balances);

  const aggSignature =
    await aggregateSignatures(signatures);

  return {
    txRoot,
    stateRoot,
    aggSignature,
    size: txs.length
  };
}