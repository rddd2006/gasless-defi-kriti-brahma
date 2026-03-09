import * as bls from "@noble/bls12-381";

/* ------------------------------------------------
   Aggregate multiple signatures
------------------------------------------------ */

export async function aggregateSignatures(signatures) {

  if (signatures.length === 1) {
    return signatures[0];
  }

  const agg = await bls.aggregateSignatures(signatures);

  return "0x" + Buffer.from(agg).toString("hex");
}

/* ------------------------------------------------
   Aggregate public keys
------------------------------------------------ */

export async function aggregatePublicKeys(pubkeys) {

  const agg = await bls.aggregatePublicKeys(pubkeys);

  return "0x" + Buffer.from(agg).toString("hex");
}