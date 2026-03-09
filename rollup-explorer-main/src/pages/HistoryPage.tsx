import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTxHistory } from "@/hooks/useRollupData";

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "confirmed") return <CheckCircle className="h-3.5 w-3.5 text-success" />;
  if (status === "failed") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  return <Loader2 className="h-3.5 w-3.5 text-warning animate-spin" />;
};

export default function HistoryPage() {
  const { history } = useTxHistory();

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-display font-bold">Transaction History</h1>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Your L2 Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="text-left py-2 font-medium">Hash</th>
                  <th className="text-left py-2 font-medium">To</th>
                  <th className="text-left py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Batch</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2.5 font-mono text-xs">{tx.hash.slice(0, 10)}...{tx.hash.slice(-4)}</td>
                    <td className="py-2.5 font-mono text-xs">{tx.to.slice(0, 8)}...{tx.to.slice(-4)}</td>
                    <td className="py-2.5 font-medium">{tx.amount} ETH</td>
                    <td className="py-2.5 text-muted-foreground">#{tx.batchId}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1">
                        <StatusIcon status={tx.status} />
                        <span className="text-xs capitalize">{tx.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
