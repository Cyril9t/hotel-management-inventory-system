import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';

export interface AlertItem {
    id: string;
    name: string;
    qtyText: string;
}

export const LowStockAlertsCard: React.FC<{ items: AlertItem[] }> = ({ items }) => {
    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        Low Stock Alert
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-destructive/10 text-destructive border border-destructive/20">
                        {items.length} Items
                    </span>
                </div>

                <div className="divide-y divide-border/60">
                    {items.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-secondary/20 px-1 rounded transition-colors">
                            <div className="flex items-center gap-2">

                                <span className="font-semibold text-foreground">{item.name}</span>
                            </div>
                            <span className="font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded text-[11px]">
                                {item.qtyText}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full pt-3 border-t border-border text-xs font-semibold text-primary hover:underline inline-flex items-center justify-center gap-1 transition-all">
                <span>Create Purchase Requisition</span>
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};