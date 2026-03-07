let mempool = [];

const MAX_BATCH = 5;

export function addToMempool(tx) {

  const exists = mempool.find(
    (t) =>
      t.from === tx.from &&
      t.nonce === tx.nonce
  );

  if (exists) {
    throw new Error("Duplicate transaction");
  }

  console.log("Sequencer ordering tx:", tx.from, tx.nonce);

  mempool.push(tx);

  console.log("Sequencer added tx. Pool size:", mempool.length);
}

export function buildBatch() {

  if (mempool.length < MAX_BATCH) {
    return null;
  }

  const batch = mempool.slice(0, MAX_BATCH);

  mempool = mempool.slice(MAX_BATCH);

  console.log("Sequencer created batch with", batch.length, "txs");

  return batch;
}

export function getPoolSize() {
  return mempool.length;
}

export function getMempool() {
  return mempool;
}