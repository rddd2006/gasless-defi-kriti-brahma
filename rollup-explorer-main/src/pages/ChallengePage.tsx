import { Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function ChallengePage() {

  const [batchId,setBatchId] = useState("");
  const [txData,setTxData] = useState("");
  const [loading,setLoading] = useState(false);

  const challenge = async () => {

    if (!batchId) {
      toast.error("Enter a batch ID");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        "http://localhost:4000/challenge",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            batchId:Number(batchId),
            proof:txData
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

      setBatchId("");
      setTxData("");

    } catch (err: unknown) {
  if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error("Something went wrong");
  }
}
 finally {

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

          <div>

            <label className="text-sm text-muted-foreground mb-1.5 block">
              Batch ID
            </label>

            <Input
              placeholder="e.g. 45"
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
              placeholder="Paste transaction data or proof..."
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

        </CardContent>

      </Card>
    </div>
  );
}