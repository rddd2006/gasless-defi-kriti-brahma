import { useEffect, useState } from "react";

const API = "http://localhost:4000";

/* ---------------- TYPES ---------------- */

export type Batch = {
  id:number
  txRoot:string
  stateRoot:string
  blsSignature:string
  txCount:number
  timestamp:number
  challengeDeadline:number
  finalized:boolean
}

export type TxHistory = {
  hash:string
  to:string
  amount:number
  batchId:number | null
  status:"pending" | "confirmed" | "failed"
}

export type MempoolTx = {
  from:string
  to:string
  amount:number
  nonce:number
}

/* ---------------- STATS ---------------- */

export function useRollupStats(){

  const [stats,setStats] = useState<any>({});

  const fetchStats = async ()=>{

    const res = await fetch(`${API}/stats`);

    const data = await res.json();

    setStats(data);

  };

  useEffect(()=>{

    fetchStats();

    const interval = setInterval(fetchStats,5000);

    return ()=>clearInterval(interval);

  },[]);

  return { stats };

}

/* ---------------- BATCHES ---------------- */

export function useBatches(){

  const [batches,setBatches] = useState<Batch[]>([]);

  const fetchBatches = async ()=>{

    const res = await fetch(`${API}/batches`);

    const data = await res.json();

    setBatches(data);

  };

  useEffect(()=>{

    fetchBatches();

    const interval = setInterval(fetchBatches,5000);

    return ()=>clearInterval(interval);

  },[]);

  return { batches };

}

/* ---------------- MEMPOOL ---------------- */

export function useMempool(){

  const [mempool,setMempool] = useState<MempoolTx[]>([]);

  const fetchMempool = async ()=>{

    const res = await fetch(`${API}/mempool`);

    const data = await res.json();

    setMempool(data);

  };

  useEffect(()=>{

    fetchMempool();

    const interval = setInterval(fetchMempool,3000);

    return ()=>clearInterval(interval);

  },[]);

  return {
    mempool,
    refresh:fetchMempool
  };

}

/* ---------------- HISTORY ---------------- */

export function useTxHistory(address?:string){

  const [history,setHistory] = useState<TxHistory[]>([]);

  const fetchHistory = async ()=>{

    if(!address) return;

    const res = await fetch(`${API}/transactions/${address}`);

    const data = await res.json();

    setHistory(data);

  };

  useEffect(()=>{

    fetchHistory();

    const interval = setInterval(fetchHistory,5000);

    return ()=>clearInterval(interval);

  },[address]);

  return { history };

}