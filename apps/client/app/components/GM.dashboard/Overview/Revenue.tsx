
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts';

const revenueTrendData = [
    { time: '6 AM', today: 120, yesterday: 80 },
    { time: '9 AM', today: 280, yesterday: 190 },
    { time: '12 PM', today: 350, yesterday: 280 },
    { time: '2 PM', today: 420, yesterday: 310 },
    { time: '6 PM', today: 680, yesterday: 420 },
    { time: '10 PM', today: 650, yesterday: 460 },
];

export function RevenueOverviewChart() {
    return (
        <div className=" bg-card border border-border rounded-(--radius) p-6 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-foreground">Revenue Overview</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Comparative hourly turnover</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-foreground">Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                        <span className="text-muted-foreground">Yesterday</span>
                    </div>
                </div>
            </div>

            <div className="w-full h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="yesterday" stroke="var(--muted-foreground)" strokeDasharray="3 3" fill="none" strokeWidth={1.5} />
                        <Area type="monotone" dataKey="today" stroke="var(--primary)" fillOpacity={1} fill="url(#todayGrad)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}