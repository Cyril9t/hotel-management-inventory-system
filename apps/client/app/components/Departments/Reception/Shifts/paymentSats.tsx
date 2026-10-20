import React from 'react';
import { Banknote, CreditCard, ArrowLeftRight, Receipt, PieChart } from 'lucide-react';

export interface BreakdownItem {
    cash: number;
    card: number;
    transfer: number;
    roomCharges: number;
}

export interface PaymentBreakdownProps {
    breakdown: BreakdownItem;
    totalRevenue: number;
}

export const PaymentBreakdownCard: React.FC<PaymentBreakdownProps> = ({
    breakdown,
    totalRevenue,
}) => {
    const items = [
        { label: 'Cash Sales', amount: breakdown.cash, icon: Banknote, color: 'text-emerald-500' },
        { label: 'Card / POS', amount: breakdown.card, icon: CreditCard, color: 'text-amber-500' },
        { label: 'Bank Transfer', amount: breakdown.transfer, icon: ArrowLeftRight, color: 'text-sky-500' },
        { label: 'Room Folio Charges', amount: breakdown.roomCharges, icon: Receipt, color: 'text-purple-500' },
    ];

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 mt-10">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <PieChart size={20} className="text-primary" />
                    Shift Revenue Breakdown
                </h3>
                <span className="text-sm font-bold text-primary">
                    Total: ₦ {totalRevenue.toLocaleString()}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={idx}
                            className="rounded-lg border border-border/60 bg-secondary/30 p-3 space-y-1.5"
                        >
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                                <span>{item.label}</span>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                ₦ {item.amount.toLocaleString()}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};