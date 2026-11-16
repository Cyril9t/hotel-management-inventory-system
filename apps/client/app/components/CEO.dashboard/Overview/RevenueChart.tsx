import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { formatReceptionCurrency, REVENUE_PERIODS, useReceptionRevenue } from "~/Context/ReceptionRevenueContext";

function compactCurrency(value: number) {
    if (value >= 1_000_000) return `\u20A6${(value / 1_000_000).toFixed(1)}m`;
    if (value >= 1_000) return `\u20A6${(value / 1_000).toFixed(0)}k`;
    return `\u20A6${value}`;
}

export function RevenueChart() {
    const { period, setPeriod, buckets, loading, error, retry, total } = useReceptionRevenue();

    return (
        <div className="bg-card border border-border rounded-radius p-6 shadow-sm mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-base font-bold text-foreground">Department Revenue Trend</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Reception payments and completed Bar and Restaurant sales grouped by {period === "daily" ? "hour" : period === "yearly" ? "month" : "day"}.</p>
                </div>
                <select aria-label="Revenue reporting period" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground">
                    {REVENUE_PERIODS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            </div>

            {error ? <div role="alert" className="flex h-72 flex-col items-center justify-center gap-3 text-center text-sm text-destructive">
                <p>Department revenue could not be loaded: {error}</p>
                <button type="button" onClick={retry} className="font-semibold underline">Retry</button>
            </div> : <>
                <div className="relative w-full h-72">
                    {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/70 text-sm text-muted-foreground">Loading payment records…</div>}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={buckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={period === "daily" ? 2 : period === "monthly" ? 2 : 0} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={compactCurrency} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={68} />
                            <Tooltip cursor={{ fill: "var(--secondary)", opacity: 0.5 }} formatter={(value) => formatReceptionCurrency(Number(value))} contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
                            <Legend />
                            <Bar dataKey="receptionAmount" name="Reception" stackId="revenue" fill="var(--primary)" maxBarSize={38} />
                            <Bar dataKey="barAmount" name="Bar" stackId="revenue" fill="var(--brand-success)" maxBarSize={38} />
                            <Bar dataKey="restaurantAmount" name="Restaurant" stackId="revenue" fill="var(--brand-gold)" radius={[4, 4, 0, 0]} maxBarSize={38} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {!loading && total === 0 && <p className="mt-2 text-center text-xs text-muted-foreground">No recorded revenue in this period.</p>}
            </>}
        </div>
    );
}
