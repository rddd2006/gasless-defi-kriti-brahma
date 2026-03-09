import { Layers, Fuel, Database, Activity, ArrowUpRight, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useRollupStats, useBatches } from "@/hooks/useRollupData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const gasComparisonData = [
  { name: "L1 Transfer", gas: 21000 },
  { name: "Rollup TX", gas: 2800 },
];

const batchEfficiency = [
  { size: 1, gasPerTx: 94000 },
  { size: 2, gasPerTx: 47000 },
  { size: 5, gasPerTx: 18800 },
  { size: 10, gasPerTx: 9400 },
  { size: 20, gasPerTx: 4700 },
  { size: 50, gasPerTx: 1880 },
];

const recentActivity = [
  { time: "5m", txs: 3 },
  { time: "10m", txs: 7 },
  { time: "15m", txs: 12 },
  { time: "20m", txs: 8 },
  { time: "25m", txs: 15 },
  { time: "30m", txs: 11 },
  { time: "35m", txs: 18 },
  { time: "40m", txs: 22 },
];

export default function Overview() {
  const { stats } = useRollupStats();
  const { batches } = useBatches();
  const savings = ((1 - stats.avgGasPerTx / 21000) * 100).toFixed(0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Good morning, <span className="gradient-text">0x148...347</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your rollup is running smoothly. {stats.totalBatches} batches finalized.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gas Savings"
          value={`${savings}%`}
          subtitle="vs L1 transfer"
          icon={Fuel}
          trend={{ value: `${savings}%`, positive: true }}
        />
        <StatCard
          title="Total Batches"
          value={stats.totalBatches}
          subtitle="All time"
          icon={Layers}
          trend={{ value: "3", positive: true }}
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTx}
          icon={Activity}
          trend={{ value: "12", positive: true }}
        />
        <StatCard
          title="Mempool"
          value={stats.mempoolSize}
          subtitle="Pending txs"
          icon={Database}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              Gas Comparison: L1 vs Rollup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gasComparisonData} barCategoryGap="40%">
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 100%)",
                    border: "1px solid hsl(220 16% 90%)",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="gas" radius={[8, 8, 0, 0]} fill="url(#gasGradient)" />
                <defs>
                  <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(252, 56%, 57%)" />
                    <stop offset="100%" stopColor="hsl(210, 80%, 55%)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Batch Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={batchEfficiency}>
                <defs>
                  <linearGradient id="effGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="size" tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 100%)",
                    border: "1px solid hsl(220 16% 90%)",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gasPerTx"
                  stroke="hsl(152, 60%, 42%)"
                  strokeWidth={2}
                  fill="url(#effGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity + Recent Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Transaction Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={recentActivity}>
                <Bar dataKey="txs" radius={[4, 4, 0, 0]} fill="hsl(252, 56%, 57%)" opacity={0.7} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Recent Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs">
                    <th className="text-left py-2 font-medium">Batch</th>
                    <th className="text-left py-2 font-medium">TXs</th>
                    <th className="text-left py-2 font-medium">State Root</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.slice(0, 5).map((b) => (
                    <tr key={b.id} className="border-t border-border">
                      <td className="py-2.5 font-medium">#{b.id}</td>
                      <td className="py-2.5">{b.txCount}</td>
                      <td className="py-2.5 font-mono text-xs text-muted-foreground">
                        {b.stateRoot.slice(0, 10)}...{b.stateRoot.slice(-6)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            b.finalized
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {b.finalized ? "Finalized" : "Pending"}
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

      {/* Compression Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">Calldata Compression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Uncompressed</span>
                <span className="font-medium">{stats.uncompressedBytes} bytes</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-warning" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Compressed</span>
                <span className="font-medium">{stats.compressedBytes} bytes</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-success"
                  style={{ width: `${(stats.compressedBytes / stats.uncompressedBytes) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold gradient-text">
                {((1 - stats.compressedBytes / stats.uncompressedBytes) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Savings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
