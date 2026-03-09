import * as bls from "@noble/bls12-381";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.BLS_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("BLS_PRIVATE_KEY missing in .env");
}

/* ---------------- SIGN BATCH ---------------- */

export async function signBatch(txRoot) {

  const message = ethers.getBytes(txRoot);

  const signature = await bls.sign(
    message,
    PRIVATE_KEY
  );

  return ethers.hexlify(signature);
}

/* ---------------- PUBLIC KEY ---------------- */

export async function getPublicKey() {

  const pub = await bls.getPublicKey(PRIVATE_KEY);

  return ethers.hexlify(pub);
}