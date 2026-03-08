import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { addTx, getStats } from "./l2Engine.js";
import { getPool } from "./sequencer/sequencer.js";
import { contract } from "./config.js";
import { startSequencer } from "./sequencer/sequencer.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(cors());
app.use(express.json());

/* ------------------------------------------------ */
/*                 START SEQUENCER                  */
/* ------------------------------------------------ */

startSequencer();

console.log("Sequencer started");

/* ------------------------------------------------ */
/*                   SUBMIT TX                      */
/* ------------------------------------------------ */

app.post("/submit", async (req, res) => {

  try {

    const { tx, signature } = req.body;

    console.log("Incoming TX:", req.body);

    await addTx(tx, signature);

    res.json({
      status: "accepted",
      mempoolSize: getPool().length
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

/* ------------------------------------------------ */
/*                 GET NEXT NONCE                   */
/* ------------------------------------------------ */

app.get("/nonce/:address", async (req, res) => {

  try {

    const address = req.params.address;

    // for now we return 0 if user has never sent tx
    const nonce = 0;

    res.json({
      address,
      nonce
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});
/* ------------------------------------------------ */
/*                 MEMPOOL VIEW                     */
/* ------------------------------------------------ */

app.get("/mempool", (req, res) => {

  const pool = getPool();

  res.json({
    size: pool.length,
    pool
  });

});

/* ------------------------------------------------ */
/*                SYSTEM STATS                      */
/* ------------------------------------------------ */

app.get("/stats", (req, res) => {

  const stats = getStats();

  res.json(stats);

});

/* ------------------------------------------------ */
/*               CHALLENGE BATCH                    */
/* ------------------------------------------------ */

app.post("/challenge", async (req, res) => {

  try {

    const { batchId, txData, signature } = req.body;

    const tx = await contract.challengeTx(
      batchId,
      txData,
      signature
    );

    await tx.wait();

    res.json({
      status: "challenge submitted"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

/* ------------------------------------------------ */
/*                LIST BATCHES                      */
/* ------------------------------------------------ */

app.get("/batches/:id", async (req, res) => {

  try {

    const id = req.params.id;

    const batch =
      await contract.batches(id);

    res.json(batch);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

/* ------------------------------------------------ */
/*                    SERVER                        */
/* ------------------------------------------------ */

const PORT = 4000;

app.listen(PORT, () => {

  console.log("Relayer running on port", PORT);

});