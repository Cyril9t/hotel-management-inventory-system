import React from 'react';
import { Package, AlertTriangle, Download, TrendingUp } from 'lucide-react';

export interface MetricsProps {
    healthPercentage: number;
    lowCount: number;
    critCount: number;
    totalItems: number;
    newItemsCount: number;
    lowStockTotal: number;
    receivedToday: number;
    deliveriesCount: number;
}

export const StoreMetricsGrid: React.FC<MetricsProps> = ({
    healthPercentage = 82,
    lowCount = 12,
    critCount = 6,
    totalItems = 256,
    newItemsCount = 12,
    lowStockTotal = 8,
    receivedToday = 18,
    deliveriesCount = 3,
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-center w-full gap-5 mb-10">

            {/* <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
                <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">Stock Health</span>
                    <div className="flex items-baseline gap-2">
                        <span className="  text-2xl font-bold text-foreground">{healthPercentage}%</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Healthy
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {lowCount}% Low
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                            {critCount}% Crit
                        </span>
                    </div>
                </div>

                
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-secondary"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="text-primary"
                            strokeDasharray={`${healthPercentage}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="absolute text-[11px] font-bold font-mono text-foreground">
                        {healthPercentage}%
                    </span>
                </div>
            </div> */}

            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm w-full">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Total Items</span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Package className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalItems}</p>

            </div>


            <div className="rounded-xl border border-border  p-4 space-y-2 shadow-sm w-full">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-destructive">Low Stock</span>
                    <div className="p-2 rounded-lg bg-destructive/20 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>
                <p className="  text-3xl font-bold text-destructive">{lowStockTotal}</p>
                <p className="text-[15px] font-semibold text-destructive">Needs attention / Reorder</p>
            </div>


            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm w-full">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Received Today</span>
                    <div className="p-2 rounded-lg bg-brand-success/10 text-brand-success">
                        <Download className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{receivedToday} Products</p>

            </div>

        </div>
    );
};