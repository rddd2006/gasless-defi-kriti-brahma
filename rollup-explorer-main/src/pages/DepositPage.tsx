import { ArrowDownToLine, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function DepositPage() {

  const [amount,setAmount] = useState("");
  const [loading,setLoading] = useState(false);
  const [txHash,setTxHash] = useState("");

  const deposit = async () => {

    if (!window.ethereum) {
      toast.error("Install MetaMask");
      return;
    }

    try {

      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ["function deposit() payable"],
        signer
      );

      const tx = await contract.deposit({
        value: parseEther(amount)
      });

      setTxHash(tx.hash);

      await tx.wait();

      toast.success("Deposit successful");

    } catch (err: unknown) {
  if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error("Something went wrong");
  }
}


    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-lg">

      <h1 className="text-2xl font-display font-bold">
        Deposit ETH to Rollup
      </h1>

      <Card>

        <CardHeader>
          <CardTitle>L1 → L2 Deposit</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Input
            placeholder="ETH amount"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
          />

          <Button onClick={deposit} disabled={loading}>
            {loading ? "Processing..." : "Deposit"}
          </Button>

          {txHash && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4"/>
              {txHash}
            </div>
          )}

        </CardContent>

      </Card>
    </div>
  );
}