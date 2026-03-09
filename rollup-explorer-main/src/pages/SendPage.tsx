import { Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function SendPage() {

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendTx = async () => {

    if (!window.ethereum) {
      toast.error("Install MetaMask");
      return;
    }

    try {

      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const from = await signer.getAddress();

      const nonceRes = await fetch(`http://localhost:4000/nonce/${from}`);
      const nonceData = await nonceRes.json();

      const tx = {
        from,
        to,
        amount: parseEther(amount).toString(),
        nonce: nonceData.nonce
      };

      const domain = {
        name: "OptimisticRollup",
        version: "1",
        chainId: 11155111,
        verifyingContract: CONTRACT_ADDRESS
      };

      const types = {
        L2Tx: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" }
        ]
      };

      const signature = await signer._signTypedData(domain, types, tx);

      await fetch("http://localhost:4000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tx, signature })
      });

      setSent(true);
      toast.success("Gasless transaction submitted");

    } catch (err:any) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-lg">
      <h1 className="text-2xl font-display font-bold">Send Gasless Transaction</h1>

      <Card>
        <CardHeader>
          <CardTitle>EIP-712 Signed Transaction</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Input
            placeholder="Recipient Address"
            value={to}
            onChange={(e)=>setTo(e.target.value)}
          />

          <Input
            placeholder="Amount ETH"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
          />

          <Button onClick={sendTx} disabled={loading}>
            {loading ? "Signing..." : "Sign & Send"}
          </Button>

          {sent && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-100">
              <CheckCircle className="h-4 w-4"/>
              Transaction sent
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}