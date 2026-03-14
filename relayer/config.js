import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env")
];

const envPath = envCandidates.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

if (!process.env.CONTRACT_ADDRESS)
  throw new Error("CONTRACT_ADDRESS missing in .env");

const artifactCandidates = [
  path.resolve(__dirname, "../out/OptimisticRollup.sol/OptimisticRollup.json"),
  path.resolve(__dirname, "../../out/OptimisticRollup.sol/OptimisticRollup.json"),
  path.resolve(process.cwd(), "out/OptimisticRollup.sol/OptimisticRollup.json"),
  path.resolve(process.cwd(), "../out/OptimisticRollup.sol/OptimisticRollup.json")
];

const artifactPath = artifactCandidates.find((p) => fs.existsSync(p));
if (!artifactPath) {
  throw new Error(
    "OptimisticRollup artifact not found. Tried: \n" +
      artifactCandidates.join("\n")
  );
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

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