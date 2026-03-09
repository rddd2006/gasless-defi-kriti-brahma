import { BarChart3, Fuel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { useRollupStats } from "@/hooks/useRollupData";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(38, 92%, 55%)", "hsl(152, 60%, 42%)"];

const networkGas = [
  { label: "Safe", gwei: 12 },
  { label: "Standard", gwei: 18 },
  { label: "Fast", gwei: 25 },
];

export default function GasAnalytics() {

  const { stats } = useRollupStats();

  const rollupGas = stats?.avgGasPerTx ?? 0;

  const gasComparison = [
    { name: "L1 Transfer", gas: 21000 },
    { name: "Rollup TX", gas: rollupGas },
  ];

  const batchData = [
    { size: 1, gas: stats.batchGas || 0 },
    { size: 2, gas: (stats.batchGas || 0) / 2 },
    { size: 5, gas: (stats.batchGas || 0) / 5 },
    { size: 10, gas: (stats.batchGas || 0) / 10 },
    { size: 20, gas: (stats.batchGas || 0) / 20 },
    { size: 50, gas: (stats.batchGas || 0) / 50 },
  ];

  const compressionData = [
    { name: "Uncompressed", value: stats.uncompressedBytes || 0 },
    { name: "Compressed", value: stats.compressedBytes || 0 },
  ];

  const savings =
    rollupGas > 0
      ? Math.round((1 - rollupGas / 21000) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-slide-up">

      <h1 className="text-2xl font-display font-bold">
        Gas Analytics
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <StatCard
          title="L1 Gas (Transfer)"
          value="21,000"
          icon={Fuel}
        />

        <StatCard
          title="Rollup Gas (Avg)"
          value={rollupGas}
          icon={Fuel}
          trend={{ value: `${savings}%`, positive: true }}
        />

        <StatCard
          title="Network Gas"
          value="18 Gwei"
          subtitle="Standard"
          icon={BarChart3}
        />

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Gas comparison */}
        <Card className="border-border shadow-sm">

          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Gas per Transaction
            </CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={250}>

              <BarChart data={gasComparison} barCategoryGap="40%">

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(220 16% 90%)",
                    fontSize: "13px",
                  }}
                />

                <Bar dataKey="gas" radius={[8, 8, 0, 0]}>

                  <Cell fill="hsl(0, 72%, 55%)" />

                  <Cell fill="hsl(152, 60%, 42%)" />

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

        {/* Batch efficiency */}
        <Card className="border-border shadow-sm">

          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Batch Size vs Gas/TX
            </CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={250}>

              <AreaChart data={batchData}>

                <defs>

                  <linearGradient
                    id="batchGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(210, 80%, 55%)"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="100%"
                      stopColor="hsl(210, 80%, 55%)"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <XAxis
                  dataKey="size"
                  tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(220 16% 90%)",
                    fontSize: "13px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="gas"
                  stroke="hsl(210, 80%, 55%)"
                  strokeWidth={2}
                  fill="url(#batchGrad)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

      </div>

      {/* Compression + Network Gas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Compression */}
        <Card className="border-border shadow-sm">

          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Calldata Compression
            </CardTitle>
          </CardHeader>

          <CardContent className="flex justify-center">

            <ResponsiveContainer width="100%" height={250}>

              <PieChart>

                <Pie
                  data={compressionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}B`}
                >

                  {compressionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}

                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(220 16% 90%)",
                    fontSize: "13px",
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

        {/* Network gas */}
        <Card className="border-border shadow-sm">

          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Network Gas Price
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="space-y-4 py-4">

              {networkGas.map((g) => (

                <div
                  key={g.label}
                  className="flex items-center gap-4"
                >

                  <span className="text-sm text-muted-foreground w-20">
                    {g.label}
                  </span>

                  <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">

                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(g.gwei / 30) * 100}%`,
                        background: "var(--gradient-primary)",
                      }}
                    />

                  </div>

                  <span className="text-sm font-display font-bold w-16 text-right">
                    {g.gwei} Gwei
                  </span>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}