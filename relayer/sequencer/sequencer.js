/* ------------------------------------------------ */
/*                    MEMPOOL                       */
/* ------------------------------------------------ */

let mempool = [];

/* ------------------------------------------------ */
/*                BATCH PARAMETERS                  */
/* ------------------------------------------------ */

const MAX_BATCH = 20;
const MIN_BATCH = 3;
const MAX_WAIT = 5000;

let lastBatchTime = Date.now();

/* ------------------------------------------------ */
/*                ADD TO MEMPOOL                    */
/* ------------------------------------------------ */

export function addToMempool(tx) {

  const exists = mempool.find(
    t => t.from === tx.from && t.nonce === tx.nonce
  );

  if (exists) {
    throw new Error("Duplicate transaction");
  }

  mempool.push(tx);

  /* Order transactions by nonce per sender */

  mempool.sort((a,b)=>{

    if(a.from === b.from){
      return Number(a.nonce) - Number(b.nonce);
    }

    return 0;
  });

  console.log("Sequencer mempool size:", mempool.length);
}

/* ------------------------------------------------ */
/*               BUILD BATCH IF READY               */
/* ------------------------------------------------ */

export function tryBuildBatch() {

  const now = Date.now();

  const poolSize = mempool.length;

  const sizeTrigger = poolSize >= MAX_BATCH;

  const latencyTrigger =
    poolSize >= MIN_BATCH &&
    now - lastBatchTime >= MAX_WAIT;

  if (!sizeTrigger && !latencyTrigger) {
    return null;
  }

  const batchSize = Math.min(poolSize, MAX_BATCH);

  const batch = mempool.slice(0, batchSize);

  mempool = mempool.slice(batchSize);

  lastBatchTime = now;

  console.log("Sequencer created batch:", batch.length);

  return batch;
}

/* ------------------------------------------------ */
/*               MEMPOOL ACCESSORS                  */
/* ------------------------------------------------ */

export function getPool() {
  return mempool;
}

export function getPoolSize() {
  return mempool.length;
}

/* ------------------------------------------------ */
/*             CONTINUOUS BATCH TIMER               */
/* ------------------------------------------------ */

export function startSequencer(submitBatch) {

  setInterval(async () => {

    const batch = tryBuildBatch();

    if (batch) {
      await submitBatch(batch);
    }

  },1000);

}