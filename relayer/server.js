import express from "express";
import cors from "cors";
import { addTx } from "./l2Engine.js";

const app = express();

/* ---------------- CORS CONFIG ---------------- */

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.post("/submit", async (req, res) => {
  try {
    console.log("Incoming TX:", req.body);

    const { tx, signature } = req.body;
    await addTx(tx, signature);

    res.json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    res.status(400).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Relayer Alive");
});

/* ---------------- START SERVER ---------------- */

app.listen(4000, () => {
  console.log("Relayer running on port 4000");
});