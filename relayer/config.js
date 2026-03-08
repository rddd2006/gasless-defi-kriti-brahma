import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "../.env" });


/* ---------------- PROVIDER ---------------- */

export const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL
);

/* ---------------- RELAYER WALLET ---------------- */

export const relayerWallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

/* ---------------- LOAD ABI ---------------- */

const artifact = JSON.parse(
  fs.readFileSync(
    "../out/OptimisticRollup.sol/OptimisticRollup.json"
  )
);

/* ---------------- CONTRACT ---------------- */

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  artifact.abi,
  relayerWallet
);

console.log("Relayer address:", relayerWallet.address);
console.log("Rollup contract:", process.env.CONTRACT_ADDRESS);