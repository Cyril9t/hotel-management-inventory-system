import { CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { formatNaira } from "../mockData";
type BarOverviewMetrics = { todaySales: number; completedSales: number };

export function BarOverviewCards({ metrics, loading }: { metrics: BarOverviewMetrics | null; incomingOrders?: number; deliveredOrders?: number; loading?: boolean }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today’s Revenue</span><TrendingUp className="h-4 w-4 text-primary" /></div><p className="mt-3 text-2xl font-bold">{loading ? "Loading…" : metrics ? formatNaira(metrics.todaySales) : "Unavailable"}</p><p className="mt-1 text-xs text-muted-foreground">From completed Bar sales returned by the sales API</p></CardContent></Card>
    <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sales Today</span><CheckCircle2 className="h-4 w-4 text-brand-success" /></div><p className="mt-3 text-2xl font-bold">{loading ? "Loading…" : metrics ? metrics.completedSales : "Unavailable"}</p><p className="mt-1 text-xs text-muted-foreground">Completed sales returned by the sales API</p></CardContent></Card>
    <Card><CardContent className="p-5"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Other activity metrics</span><p className="mt-3 text-sm text-muted-foreground">The Bar staff role cannot read stock balances, and the API has no Bar incoming-order feed. will display here after the api is updated</p></CardContent></Card>
  </div>;
}
