import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface StockItem {
    id: string;
    name: string;
    quantityReceived: number;
    sold: number;
    availableText: string;
    valuation?: number;
}

export interface StockTableProps {
    items: StockItem[];
    onViewAllHistory?: () => void;
}

export const BarDrinksStockTable: React.FC<StockTableProps> = ({
    items,
    onViewAllHistory,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">


            <div className="p-4 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">Bar Drinks Stock</h3>
            </div>



            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="p-3.5 pl-4">Drinks</th>
                            <th className="p-3.5">Quantity Received</th>
                            <th className="p-3.5">Sold</th>
                            <th className="p-3.5 pr-4 text-right">Available</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="p-3.5 pl-4 font-bold text-foreground">
                                    {item.name}
                                </td>
                                <td className="p-3.5 font-mono text-muted-foreground">
                                    {item.quantityReceived}
                                </td>
                                <td className="p-3.5 font-mono text-muted-foreground">
                                    {item.sold}
                                </td>
                                <td className="p-3.5 pr-4 text-right font-serif font-bold text-foreground">
                                    {item.valuation ? `₦ ${item.valuation.toLocaleString()}` : item.availableText}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Card Footer Link */}
            <div className="p-3.5 border-t border-border bg-card">
                <button
                    type="button"
                    onClick={onViewAllHistory}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-all"
                >
                    <span>View all stock history</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

        </div>
    );
};