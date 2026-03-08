import { contract } from "../relayer/config.js";

/* ------------------------------------------------ */
/*           CHECK SPONSORSHIP ELIGIBILITY          */
/* ------------------------------------------------ */

export async function checkSponsorship(tx) {

  console.log(
    "Checking sponsorship eligibility for:",
    tx.from
  );

  const allowed =
    await contract.isEligibleForSponsorship(
      tx.from,
      tx.to
    );

  if (!allowed) {

    throw new Error(
      "Sponsorship denied (quota exceeded or target not whitelisted)"
    );

  }

  console.log(
    "Sponsorship approved for:",
    tx.from
  );
}