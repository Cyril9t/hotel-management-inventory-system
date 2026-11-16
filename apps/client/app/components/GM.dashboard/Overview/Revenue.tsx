import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";
import { formatReceptionCurrency, REVENUE_PERIODS, useReceptionRevenue } from "~/Context/ReceptionRevenueContext";

function compactCurrency(value: number) {
    if (value >= 1_000_000) return `\u20A6${(value / 1_000_000).toFixed(1)}m`;
    if (value >= 1_000) return `\u20A6${(value / 1_000).toFixed(0)}k`;
    return `\u20A6${value}`;
}

export function RevenueOverviewChart() {
    const { period, setPeriod, buckets, loading, error, retry, total } = useReceptionRevenue();
    return (
        <div className="bg-card border border-border rounded-(--radius) p-6 shadow-sm flex flex-col justify-between h-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-base font-bold text-foreground">Department Revenue Overview</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Reception payments and completed Bar and Restaurant sales grouped by {period === "daily" ? "hour" : period === "yearly" ? "month" : "day"}.</p>
                </div>
                <select aria-label="Revenue reporting period" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground">
                    {REVENUE_PERIODS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            </div>

            {error ? <div role="alert" className="flex min-h-56 flex-col items-center justify-center gap-3 text-center text-sm text-destructive">
                <p>Department revenue could not be loaded: {error}</p>
                <button type="button" onClick={retry} className="font-semibold underline">Retry</button>
            </div> : <>
                <div className="relative w-full h-56 mt-2">
                    {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/70 text-sm text-muted-foreground">Loading payment records…</div>}
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={buckets} margin={{ top: 10, right: 10, left: 4, bottom: 0 }}>
                            <defs>
                                <linearGradient id="receptionRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={period === "daily" ? 2 : period === "monthly" ? 2 : 0} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={compactCurrency} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={68} />
                            <Tooltip contentStyle={{  backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "var(--radius)" }} formatter={(value) => formatReceptionCurrency(Number(value))} />
                            <Legend />
                            <Area type="monotone" dataKey="receptionAmount" name="Reception" stackId="revenue" stroke="var(--primary)" fill="url(#receptionRevenueGradient)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                            <Area type="monotone" dataKey="barAmount" name="Bar" stackId="revenue" stroke="var(--brand-success)" fill="var(--brand-success)" fillOpacity={0.25} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                            <Area type="monotone" dataKey="restaurantAmount" name="Restaurant" stackId="revenue" stroke="var(--brand-gold)" fill="var(--brand-gold)" fillOpacity={0.2} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                {!loading && total === 0 && <p className="mt-2 text-center text-xs text-muted-foreground">No recorded revenue in this period.</p>}
            </>}
        </div>
    );
}
