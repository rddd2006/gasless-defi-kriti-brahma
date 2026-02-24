import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const wallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY);

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

async function signTx(tx) {

  const signature = await wallet.signTypedData(
    domain,
    types,
    tx
  );

  console.log("Signature:", signature);

  return signature;
}

export { signTx };