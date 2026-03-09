import { Layers, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBatches } from "@/hooks/useRollupData";
import { useState } from "react";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function countdown(deadline: number) {
  const diff = deadline - Date.now();
  if (diff <= 0) return "Expired";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function BatchesPage() {
  const { batches } = useBatches();
  const [selected, setSelected] = useState<number | null>(null);
  const batch = batches.find((b) => b.id === selected);

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-display font-bold">Batch Explorer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                All Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs">
                      <th className="text-left py-2 font-medium">Batch</th>
                      <th className="text-left py-2 font-medium">TXs</th>
                      <th className="text-left py-2 font-medium">Time</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => setSelected(b.id)}
                        className={`border-t border-border cursor-pointer transition-colors ${
                          selected === b.id ? "bg-accent/50" : "hover:bg-secondary/50"
                        }`}
                      >
                        <td className="py-2.5 font-medium">#{b.id}</td>
                        <td className="py-2.5">{b.txCount}</td>
                        <td className="py-2.5 text-muted-foreground">{timeAgo(b.timestamp)}</td>
                        <td className="py-2.5">
                          {b.finalized ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                              <CheckCircle className="h-3 w-3" /> Finalized
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                              <Clock className="h-3 w-3" /> {countdown(b.challengeDeadline)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {batch ? (
            <Card className="border-border shadow-sm sticky top-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display">Batch #{batch.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">TX Root</p>
                  <p className="font-mono text-xs bg-secondary p-2 rounded-lg break-all">{batch.txRoot}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">State Root</p>
                  <p className="font-mono text-xs bg-secondary p-2 rounded-lg break-all">{batch.stateRoot}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">BLS Signature</p>
                  <p className="font-mono text-xs bg-secondary p-2 rounded-lg break-all">{batch.blsSignature.slice(0, 66)}...</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-medium">{batch.txCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {batch.finalized ? (
                    <span className="text-success font-medium">Finalized</span>
                  ) : (
                    <span className="text-warning font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Challenge: {countdown(batch.challengeDeadline)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-sm">
              <CardContent className="py-16 text-center text-muted-foreground text-sm">
                Select a batch to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
