import { Database, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMempool } from "@/hooks/useRollupData";

function short(addr: string) {
  if (!addr) return "-";
  return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
}

export default function MempoolPage() {

  const { mempool, refresh } = useMempool();

  return (
    <div className="space-y-6 animate-slide-up">

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-display font-bold">
          Mempool
        </h1>

        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>

      </div>

      <Card className="border-border shadow-sm">

        <CardHeader className="pb-2">

          <CardTitle className="text-base font-display flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Pending Transactions ({mempool.length})
          </CardTitle>

        </CardHeader>

        <CardContent>

          <table className="w-full text-sm">

            <thead>
              <tr className="text-muted-foreground text-xs">

                <th className="text-left py-2 font-medium">
                  From
                </th>

                <th className="text-left py-2 font-medium">
                  To
                </th>

                <th className="text-left py-2 font-medium">
                  Amount
                </th>

                <th className="text-left py-2 font-medium">
                  Nonce
                </th>

              </tr>
            </thead>

            <tbody>

              {mempool.length > 0 ? (

                mempool.map((tx) => (

                  <tr
                    key={`${tx.from}-${tx.nonce}`}
                    className="border-t border-border"
                  >

                    <td className="py-2.5 font-mono text-xs">
                      {short(tx.from)}
                    </td>

                    <td className="py-2.5 font-mono text-xs">
                      {short(tx.to)}
                    </td>

                    <td className="py-2.5 font-medium">
                      {tx.amount} ETH
                    </td>

                    <td className="py-2.5 text-muted-foreground">
                      {tx.nonce}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground text-sm"
                  >
                    No pending transactions
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </CardContent>

      </Card>

    </div>
  );
}