import { contract } from "../relayer/config.js";

/*
Gas Sponsorship Policy Module
Prevents relayer gas drain attacks
*/

export async function checkSponsorship(tx) {

  console.log("Checking sponsorship eligibility for:", tx.from);

  const eligible = await contract.isEligibleForSponsorship(
    tx.from,
    tx.to
  );

  if (!eligible) {
    throw new Error(
      "Sponsorship rejected: quota exceeded or target not whitelisted"
    );
  }

  console.log("Sponsorship approved for:", tx.from);

  return true;
}