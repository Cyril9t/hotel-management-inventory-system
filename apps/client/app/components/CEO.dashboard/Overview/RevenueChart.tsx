import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

const data = [
    { month: 'Jan', revenue: 35 },
    { month: 'Feb', revenue: 42 },
    { month: 'Mar', revenue: 50 },
    { month: 'Apr', revenue: 60 },
    { month: 'May', revenue: 78 },
    { month: 'Jun', revenue: 57 },
    { month: 'Jul', revenue: 65 },
    { month: 'Aug', revenue: 72 },
    { month: 'Sep', revenue: 48 },
    { month: 'Oct', revenue: 88 },
    { month: 'Nov', revenue: 96 },
    { month: 'Dec', revenue: 100 },
];


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border px-3 py-2 rounded-[var(--radius)] shadow-lg text-xs">
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-primary font-bold mt-0.5">
                    Revenue: ₦ {payload[0].value}M
                </p>
            </div>
        );
    }
    return null;
};

export function RevenueChart() {
    const [timeframe, setTimeframe] = useState('This Year');

    return (
        <div className="bg-card border border-border rounded-radius p-6 shadow-sm mt-10">

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-foreground">Revenue Trend</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Monthly consolidated hotel yield overview
                    </p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-input rounded--radius text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <span>{timeframe}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
            </div>


            <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="var(--border)"
                        />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value: any) => `${value}M`}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--secondary)', opacity: 0.5 }} />
                        <Bar
                            dataKey="revenue"
                            fill="var(--primary)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={38}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}