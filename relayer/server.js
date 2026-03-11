import express from "express";
import cors from "cors";
import { addTx, getProof, getBatch } from "./l2Engine.js";
import { contract } from "./config.js";

const app = express();

/* ---------------- MEMORY STATE ---------------- */

let mempool = [];
let batches = [];
let history = [];

/* ---------------- CORS ---------------- */

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:8080"
  ],
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- SUBMIT TX ---------------- */

app.post("/submit", async (req,res)=>{

  try{

    const { tx, signature } = req.body;

    console.log("Incoming TX:", tx);

    const result = await addTx(tx, signature);

    mempool.push(tx);

    history.push({
      hash: "0x"+Math.random().toString(16).slice(2),
      to: tx.to,
      amount: tx.amount,
      batchId: null,
      status: "pending"
    });

    /* store batch metadata when created */

    if(result?.batchCreated){

      batches.push({
        id: result.batchId,
        txCount: result.txs.length,
        timestamp: Date.now(),
        finalized: false
      });

      console.log("Batch stored in explorer memory:", result.batchId);
    }

    res.json({ success:true });

  }catch(err){

    console.error(err);

    res.status(400).json({ error:err.message });

  }

});

/* ---------------- CHALLENGE ---------------- */

app.post("/challenge", async (req,res)=>{

  try{

    const { batchId, txIndex } = req.body;

    const batch = getBatch(batchId);

    if(!batch){
      return res.status(400).json({ error:"Batch not found" });
    }

    const tx = batch.txs[txIndex];
    const signature = batch.signatures[txIndex];

    if(!tx){
      return res.status(400).json({ error:"TX not found in batch" });
    }

    const proof = getProof(batchId, txIndex);

    const txResponse = await contract.challengeTx(
      batchId,
      tx,
      signature,
      proof.proof
    );

    await txResponse.wait();

    res.json({ status:"challenge submitted" });

  }catch(err){

    console.error(err);

    res.status(500).json({ error:err.message });

  }

});

/* ---------------- NONCE ---------------- */

app.get("/nonce/:address", async (req,res)=>{

  try{

    const nonce = 0;

    res.json({ nonce });

  }catch(err){

    res.status(500).json({
      error:"Failed to fetch nonce"
    });

  }

});

/* ---------------- MEMPOOL ---------------- */

app.get("/mempool",(req,res)=>{
  res.json(mempool);
});

/* ---------------- BATCHES ---------------- */

app.get("/batches",(req,res)=>{
  res.json(batches);
});

/* ---------------- STATS ---------------- */

app.get("/stats",(req,res)=>{

  const stats = {

    totalBatches: batches.length,
    totalTx: history.length,
    mempoolSize: mempool.length,
    avgGasPerTx: 2800,
    batchGas: 94000,
    compressedBytes: 260,
    uncompressedBytes: 640

  };

  res.json(stats);

});

/* ---------------- TX HISTORY ---------------- */

app.get("/transactions/:address",(req,res)=>{

  const address = req.params.address.toLowerCase();

  const userTx = history.filter(
    tx => tx.to.toLowerCase() === address
  );

  res.json(userTx);

});

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req,res)=>{
  res.send("Relayer Alive");
});

/* ---------------- START ---------------- */

app.listen(4000,()=>{
  console.log("Relayer running on port 4000");
});