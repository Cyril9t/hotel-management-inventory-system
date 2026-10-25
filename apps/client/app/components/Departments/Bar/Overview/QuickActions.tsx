import React from 'react';
import { Plus, CreditCard, BookOpen, BarChart3 } from 'lucide-react';

export interface QuickActionsProps {
    onNewOrder: () => void;
    onMakePayment: () => void;
    onViewMenu: () => void;
    onSalesReport: () => void;
}

export const BarQuickActionsCard: React.FC<QuickActionsProps> = ({
    onNewOrder,
    onMakePayment,
    onViewMenu,
    onSalesReport,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>

            <div className="space-y-2.5">
                {/* Primary Action: New Order */}
                <button
                    onClick={onNewOrder}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded-[var(--radius)] bg-primary text-primary-foreground shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Order</span>
                </button>

                {/* Secondary Action: Make Payment */}
                <button
                    onClick={onMakePayment}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground transition-all flex items-center justify-center gap-2"
                >
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Make Payment</span>
                </button>

                {/* Secondary Action: View Menu */}
                <button
                    onClick={onViewMenu}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground transition-all flex items-center justify-center gap-2"
                >
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>View Menu</span>
                </button>

                {/* Secondary Action: Sales Report */}
                <button
                    onClick={onSalesReport}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground transition-all flex items-center justify-center gap-2"
                >
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span>Sales Report</span>
                </button>
            </div>
        </div>
    );
};