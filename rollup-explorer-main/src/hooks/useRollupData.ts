import { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

export type RollupStats = {
  totalBatches: number;
  totalTx: number;
  mempoolSize: number;
  avgGasPerTx: number;
  batchGas: number;
  compressedBytes: number;
  uncompressedBytes: number;
};

export type Batch = {
  id: number;
  txRoot: string;
  stateRoot: string;
  blsSignature: string;
  txCount: number;
  timestamp: number;
  challengeDeadline: number;
  finalized: boolean;
};

export type MempoolTx = {
  from: string;
  to: string;
  amount: number;
  nonce: number;
};

export type TxHistory = {
  hash: string;
  to: string;
  amount: number;
  batchId: number;
  status: "pending" | "confirmed" | "failed";
};

/* ---------------- MOCK DATA ---------------- */

const mockStats: RollupStats = {
  totalBatches: 12,
  totalTx: 78,
  mempoolSize: 2,
  avgGasPerTx: 2800,
  batchGas: 94000,
  compressedBytes: 260,
  uncompressedBytes: 640,
};

const mockBatches: Batch[] = [
  {
    id: 12,
    txRoot: "0xabc123...",
    stateRoot: "0xdef456...",
    blsSignature: "0xbls...",
    txCount: 5,
    timestamp: Date.now() - 600000,
    challengeDeadline: Date.now() + 300000,
    finalized: false,
  },
];

const mockMempool: MempoolTx[] = [
  {
    from: "0x50200a40066aDf6C5e02c5946895fE1110D2459A",
    to: "0x12345a40066aDf6C5e02c5946895fE1110D2459A",
    amount: 0.5,
    nonce: 5,
  },
];

const mockHistory: TxHistory[] = [
  {
    hash: "0xabc123",
    to: "0x12345a40066aDf6C5e02c5946895fE1110D2459A",
    amount: 0.2,
    batchId: 10,
    status: "confirmed",
  },
];

/* ---------------- STATS ---------------- */

export function useRollupStats() {

  const [stats, setStats] = useState<RollupStats>(mockStats);

  return { stats };
}

/* ---------------- BATCHES ---------------- */

export function useBatches() {

  const [batches, setBatches] = useState<Batch[]>(mockBatches);

  return { batches };
}

/* ---------------- MEMPOOL ---------------- */

export function useMempool() {

  const [mempool, setMempool] =
    useState<MempoolTx[]>(mockMempool);

  const refresh = () => {
    setMempool([...mockMempool]);
  };

  useEffect(() => {

    const interval = setInterval(() => {
      setMempool([...mockMempool]);
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  return { mempool, refresh };
}

/* ---------------- HISTORY ---------------- */

export function useTxHistory() {

  const [history, setHistory] =
    useState<TxHistory[]>(mockHistory);

  return { history };
}