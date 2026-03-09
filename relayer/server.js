import express from "express";
import cors from "cors";
import { addTx, getProof } from "./l2Engine.js";
import { contract } from "./config.js";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- SUBMIT TX ---------------- */

app.post("/submit", async (req,res)=>{

  try{

    const { tx, signature } = req.body;

    console.log("Incoming TX:",tx);

    await addTx(tx,signature);

    res.json({success:true});

  }catch(err){

    console.error(err);

    res.status(400).json({error:err.message});
  }

});

/* ---------------- CHALLENGE ---------------- */

app.post("/challenge", async (req,res)=>{

  try{

    const { batchId, tx, signature } = req.body;

    const proof = getProof(batchId, tx);

    const txResponse = await contract.challengeTx(
      batchId,
      tx,
      signature,
      proof
    );

    await txResponse.wait();

    res.json({status:"challenge submitted"});

  }catch(err){

    console.error(err);

    res.status(500).json({error:err.message});
  }

});

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req,res)=>{
  res.send("Relayer Alive");
});

/* ---------------- START ---------------- */

app.listen(4000,()=>{
  console.log("Relayer running on port 4000");
});