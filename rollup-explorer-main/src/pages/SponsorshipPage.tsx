import { Fuel, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";

export default function SponsorshipPage() {
  const remaining = 3;
  const total = 5;
  const whitelisted = true;

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <h1 className="text-2xl font-display font-bold">Sponsorship Status</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Free TXs Remaining" value={`${remaining} / ${total}`} icon={Fuel} />
        <StatCard
          title="Whitelist Status"
          value={whitelisted ? "Active" : "Inactive"}
          icon={CheckCircle}
          trend={whitelisted ? { value: "Whitelisted", positive: true } : undefined}
        />
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-display">Daily Quota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used today</span>
              <span className="font-medium">{total - remaining} / {total}</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((total - remaining) / total) * 100}%`,
                  background: "var(--gradient-primary)",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Quota resets daily at midnight UTC. Whitelisted addresses receive 5 free gasless transactions per day.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
