import { Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";

export default function ChallengePage() {

  const [address, setAddress] = useState<string>("");
  const [batchId,setBatchId] = useState("");
  const [txData,setTxData] = useState("");
  const [loading,setLoading] = useState(false);

  const connectWallet = async () => {

    if (!window.ethereum) {
      toast.error("Install MetaMask");
      console.warn("ChallengePage: window.ethereum not available");
      return;
    }

    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const addr = await signer.getAddress();

      setAddress(addr);

      console.log("[ChallengePage] wallet connected", { addr });

      toast.success("Wallet connected");

    } catch (err) {

      console.error("[ChallengePage] wallet connect failed", err);

      if (err instanceof Error) {
        toast.error(err.message);
      }

    }

  };

  const challenge = async () => {

    console.log("[ChallengePage] challenge clicked", { address, batchId, txData });

    if (!address) {
      toast.error("Connect wallet first");
      console.warn("ChallengePage: no address");
      return;
    }

    if (!batchId) {
      toast.error("Enter a batch ID");
      console.warn("ChallengePage validation failed", { batchId });
      return;
    }

    if (!txData) {
      toast.error("Enter transaction index");
      console.warn("ChallengePage validation failed", { txData });
      return;
    }

    try {

      setLoading(true);

      const txIndex = Number(txData);

      if (isNaN(txIndex)) {
        toast.error("TX index must be a number");
        return;
      }

      const res = await fetch(
        "http://localhost:4000/challenge",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            batchId:Number(batchId),
            txIndex
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Challenge failed");
      }

      toast.success(
        `Fraud challenge submitted for batch #${batchId}`
      );

      console.log("[ChallengePage] challenge submitted success", { batchId, txIndex });

      setBatchId("");
      setTxData("");

    } catch (err: unknown) {

      console.error("[ChallengePage] challenge error", err);

      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Challenge failed");
      }

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="space-y-6 animate-slide-up max-w-lg">

      <h1 className="text-2xl font-display font-bold">
        Fraud Challenge
      </h1>

      <div className="p-4 rounded-xl bg-warning/10 flex items-start gap-3">

        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5"/>

        <p className="text-sm text-foreground">
          Submit a fraud proof to challenge an invalid batch.
        </p>

      </div>

      <Card className="border-border shadow-sm">

        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary"/>
            Challenge Batch
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {!address ? (

            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>

          ) : (

            <>

              <div className="text-sm text-muted-foreground">
                <p>Connected: {address}</p>
              </div>

              <div>

                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Batch ID
                </label>

                <Input
                  placeholder="e.g. 0"
                  value={batchId}
                  onChange={(e)=>setBatchId(e.target.value)}
                  className="rounded-xl bg-secondary border-0 h-11"
                />

              </div>

              <div>

                <label className="text-sm text-muted-foreground mb-1.5 block">
                  TX Data / Merkle Proof
                </label>

                <Textarea
                  placeholder="Enter transaction index (e.g. 2)"
                  value={txData}
                  onChange={(e)=>setTxData(e.target.value)}
                  className="rounded-xl bg-secondary border-0 min-h-[100px] text-sm font-mono"
                />

              </div>

              <Button
                onClick={challenge}
                disabled={loading}
                variant="destructive"
                className="w-full rounded-xl h-12 text-base font-display"
              >
                {loading ? "Submitting..." : "Submit Challenge"}
              </Button>

            </>

          )}

        </CardContent>

      </Card>

    </div>
  );
}