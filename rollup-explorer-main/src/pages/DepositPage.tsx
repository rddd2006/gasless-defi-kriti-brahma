import { ArrowDownToLine, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function DepositPage() {

  const [amount,setAmount] = useState("");
  const [loading,setLoading] = useState(false);
  const [txHash,setTxHash] = useState("");
  const [address, setAddress] = useState<string>("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Install MetaMask");
      console.warn("DepositPage: window.ethereum not available");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      console.log("[DepositPage] wallet connected", { addr });
      toast.success("Wallet connected");
    } catch (err) {
      console.error("[DepositPage] wallet connect failed", err);
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const deposit = async () => {
    console.log("[DepositPage] deposit clicked", { amount, address });

    if (!amount) {
      toast.error("Enter deposit amount");
      console.warn("DepositPage validation failed", { amount });
      return;
    }

    if (!address) {
      toast.error("Connect wallet first");
      console.warn("DepositPage: no address connected");
      return;
    }

    if (!window.ethereum) {
      toast.error("Install MetaMask");
      console.warn("DepositPage: window.ethereum not available");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (!accounts || accounts.length === 0) {
      toast.error("Connect your wallet first");
      console.warn("DepositPage: no connected accounts", { accounts });
      return;
    }

    if (!CONTRACT_ADDRESS) {
      toast.error("Contract address not configured in VITE_CONTRACT_ADDRESS");
      console.error("DepositPage: CONTRACT_ADDRESS missing");
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
      console.log("[DepositPage] tx submitted", { txHash: tx.hash, amount });

      await tx.wait();

      toast.success("Deposit successful");
      console.log("[DepositPage] deposit confirmed", { txHash: tx.hash });

    } catch (err: unknown) {
      console.error("[DepositPage] deposit error", err);
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
        Deposit ETH to Rollup
      </h1>

      <Card>

        <CardHeader>
          <CardTitle>L1 → L2 Deposit</CardTitle>
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
                  <span className="font-mono text-xs">{txHash}</span>
                </div>
              )}
            </>
          )}

        </CardContent>

      </Card>
    </div>
  );
}