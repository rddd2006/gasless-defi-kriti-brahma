import * as bls from "@noble/bls12-381";

/* ------------------------------------------------ */
/*           AGGREGATE BLS SIGNATURES               */
/* ------------------------------------------------ */

export async function aggregateSignatures(signatures) {

  if (signatures.length === 0) {
    return null;
  }

  const agg = await bls.aggregateSignatures(signatures);

  return agg;
}

/* ------------------------------------------------ */
/*           VERIFY AGGREGATED SIGNATURE            */
/* ------------------------------------------------ */

export async function verifyAggregate(
  signature,
  messages,
  pubkeys
) {

  return bls.verifyBatch(signature, messages, pubkeys);
}