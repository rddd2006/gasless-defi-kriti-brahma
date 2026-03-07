import { ethers } from "ethers";

export function signSponsorship(txHash, wallet) {

  return wallet.signMessage(
    ethers.getBytes(txHash)
  );
}