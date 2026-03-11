import { Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function SendPage() {

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [nonce, setNonce] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");

  const connectWalletAndLoadNonce = async () => {

    if (!window.ethereum) {
      toast.error("Install MetaMask");
      return;
    }

    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = await provider.getSigner();

      const addr = await signer.getAddress();

      setAddress(addr);

      const res = await fetch(`http://localhost:4000/nonce/${addr}`);

      const data = await res.json();

      const fetchedNonce = data.nonce || 0;

      setNonce(fetchedNonce);

      console.log("[SendPage] wallet connected, nonce loaded", { addr, nonce: fetchedNonce });

      toast.success("Wallet connected");

    } catch (err) {

      console.error("[SendPage] wallet connect failed", err);

      if (err instanceof Error) {
        toast.error(err.message);
      }

    }

  };

  const sendTx = async () => {

    console.log("[SendPage] sendTx clicked", { to, amount, nonce });

    if (!to || !amount) {
      toast.error("Recipient and amount are required");
      console.warn("SendPage validation failed", { to, amount });
      return;
    }

    if (nonce === null) {
      toast.error("Connect wallet first to load nonce");
      console.warn("SendPage: nonce not loaded yet");
      return;
    }

    if (!window.ethereum) {
      toast.error("Install MetaMask");
      console.warn("SendPage: window.ethereum not available");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (!accounts || accounts.length === 0) {
      toast.error("Connect your wallet first");
      console.warn("SendPage: no connected accounts", { accounts });
      return;
    }

    if (!CONTRACT_ADDRESS) {
      toast.error("Contract address not configured in VITE_CONTRACT_ADDRESS");
      console.error("SendPage: CONTRACT_ADDRESS missing");
      return;
    }

    try {

      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = await provider.getSigner();

      const from = await signer.getAddress();

      const tx = {
        from,
        to,
        amount: parseEther(amount).toString(),
        nonce: nonce.toString()
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

      /* ---------------- SIGNATURE FIX ---------------- */

      const rawSignature = await signer._signTypedData(domain, types, tx);

      const signature = ethers.utils.joinSignature(
        ethers.utils.splitSignature(rawSignature)
      );

      /* ------------------------------------------------ */

      const response = await fetch("http://localhost:4000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tx, signature })
      });

      if (!response.ok) {

        const errText = await response.text();

        throw new Error(`Submit failed: ${response.status} ${response.statusText} ${errText}`);

      }

      setSent(true);

      const newNonce = nonce + 1;

      setNonce(newNonce);

      toast.success("Gasless transaction submitted");

      console.log("[SendPage] submit success, nonce incremented", {
        prevNonce: nonce,
        newNonce,
        tx,
        signature
      });

      console.log("signature full:", signature);

    } catch (err: unknown) {

      console.error("[SendPage] sendTx error", err);

      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="space-y-6 animate-slide-up max-w-lg">

      <h1 className="text-2xl font-display font-bold">
        Send Gasless Transaction
      </h1>

      <Card>

        <CardHeader>
          <CardTitle>EIP-712 Signed Transaction</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {!address ? (

            <Button onClick={connectWalletAndLoadNonce} className="w-full">
              Connect Wallet & Load Nonce
            </Button>

          ) : (

            <>

              <div className="text-sm text-muted-foreground">

                <p>Connected: {address}</p>

                <p>
                  Current Nonce:
                  <span className="font-mono font-bold text-foreground">
                    {nonce !== null ? nonce : "Loading..."}
                  </span>
                </p>

              </div>

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

              <Button onClick={sendTx} disabled={loading || nonce === null}>
                {loading ? "Signing..." : "Sign & Send"}
              </Button>

              {sent && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-100">
                  <CheckCircle className="h-4 w-4"/>
                  Transaction sent
                </div>
              )}

            </>

          )}

        </CardContent>

      </Card>

    </div>
  );
}