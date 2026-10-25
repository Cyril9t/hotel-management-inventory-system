import React from 'react';

export interface BarMetricsProps {
    totalSales: number;
    totalOrders: number;
    totalStocks: number;
}

export const BarMetricsGrid: React.FC<BarMetricsProps> = ({
    totalSales,
    totalOrders,
    totalStocks,
}) => {
    return (
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


            <div className="rounded-xl border border-border bg-card p-6 space-y-1 shadow-sm ">
                <h1 className="text-xl font-semibold text-muted-foreground mb-2 ">Total sales</h1>

                <p className="text-2xl font-bold text-foreground">
                    ₦ {totalSales.toLocaleString()}
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
                <h1 className="text-xl font-semibold text-muted-foreground mb-2">Total Orders</h1>
                <p className="text-2xl font-bold text-foreground">
                    {totalOrders}
                </p>
            </div>


            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
                <h1 className="text-xl font-semibold text-muted-foreground mb-2">Order Charge To Room</h1>
                <p className="text-2xl font-bold text-foreground">
                    6
                </p>
            </div>


            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
                <h1 className="text-xl font-semibold text-muted-foreground mb-2">Total Stocks</h1>
                <p className="text-2xl font-bold text-foreground">
                    {totalStocks}
                </p>
            </div>

        </div>
    );
};