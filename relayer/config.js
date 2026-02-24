import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "../.env" });

if (!process.env.CONTRACT_ADDRESS)
  throw new Error("CONTRACT_ADDRESS missing in .env");

const artifact = JSON.parse(
  fs.readFileSync(
    "../out/OptimisticRollup.sol/OptimisticRollup.json",
    "utf8"
  )
);

export const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL
);

export const relayerWallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  artifact.abi,
  relayerWallet
);