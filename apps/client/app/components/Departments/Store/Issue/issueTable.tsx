import React from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface IssuedLineItem {
    id: string;
    productName: string;
    category: string;
    unitOfMeasure: string;
    mainStoreAvailable: number;
    deptCurrentBalance: number;
    qtyToIssue: number;
    unitCost: number;
    totalCost: number;
}

export interface TableProps {
    items: IssuedLineItem[];
    availableProducts: Array<{ name: string; mainStore: number; unitCost: number; unit: string; category: string }>;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (id: string, field: keyof IssuedLineItem, value: any) => void;
}

export const IssuedItemsTable: React.FC<TableProps> = ({
    items,
    availableProducts,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-3">
            {/* Table Header Controls */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Items Issued Line Entry</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Validate store limits, set issue quantities, and review department transfer values
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onAddItem}
                    className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius)] bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all flex items-center gap-1.5"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Transfer Item</span>
                </button>
            </div>

            {/* Grid Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="p-3 pl-4 min-w-[200px]">Product Selection</th>
                            <th className="p-3 w-28">Main Store Available</th>
                            <th className="p-3 w-28">Dept Balance</th>
                            <th className="p-3 w-28">Qty to Issue</th>
                            <th className="p-3 w-32">Unit Cost (₦)</th>
                            <th className="p-3 w-32">Line Total (₦)</th>
                            <th className="p-3 pr-4 text-right w-12">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                        {items.map((item) => {
                            const isOverStock = item.qtyToIssue > item.mainStoreAvailable;

                            return (
                                <tr key={item.id} className="hover:bg-secondary/20 transition-colors">

                                    {/* Product Dropdown Selector */}
                                    <td className="p-3 pl-4">
                                        <select
                                            value={item.productName}
                                            onChange={(e) => {
                                                const selected = availableProducts.find((p) => p.name === e.target.value);
                                                if (selected) {
                                                    onUpdateItem(item.id, 'productName', selected.name);
                                                    onUpdateItem(item.id, 'mainStoreAvailable', selected.mainStore);
                                                    onUpdateItem(item.id, 'unitCost', selected.unitCost);
                                                    onUpdateItem(item.id, 'unitOfMeasure', selected.unit);
                                                    onUpdateItem(item.id, 'category', selected.category);
                                                }
                                            }}
                                            className="w-full px-2.5 py-1.5 rounded border border-input bg-card text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="">Select Item from Catalog...</option>
                                            {availableProducts.map((p) => (
                                                <option key={p.name} value={p.name}>
                                                    {p.name} ({p.mainStore} {p.unit} in Store)
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Main Store Available Stock */}
                                    <td className="p-3 font-mono font-bold text-foreground">
                                        {item.mainStoreAvailable} {item.unitOfMeasure}
                                    </td>

                                    {/* Dept Current Balance */}
                                    <td className="p-3 font-mono text-muted-foreground">
                                        {item.deptCurrentBalance} {item.unitOfMeasure}
                                    </td>

                                    {/* Qty to Issue Input (With Over-stock warning indicator) */}
                                    <td className="p-3">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.mainStoreAvailable}
                                                value={item.qtyToIssue || ''}
                                                onChange={(e) => {
                                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                    onUpdateItem(item.id, 'qtyToIssue', val);
                                                }}
                                                className={`w-full px-2 py-1.5 rounded border bg-card font-mono font-bold text-right focus:outline-none focus:ring-1 ${isOverStock
                                                    ? 'border-destructive text-destructive focus:ring-destructive'
                                                    : 'border-input text-primary focus:ring-ring'
                                                    }`}
                                            />
                                            {isOverStock && (
                                                <span className="text-[10px] text-destructive font-bold flex items-center gap-0.5 mt-0.5 justify-end">
                                                    <AlertCircle className="w-3 h-3" /> Exceeds stock
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Unit Cost */}
                                    <td className="p-3 font-mono text-muted-foreground text-right pr-2">
                                        ₦ {item.unitCost.toLocaleString()}
                                    </td>

                                    {/* Line Total Valuation */}
                                    <td className="p-3   font-bold text-primary text-right pr-2">
                                        ₦ {(item.qtyToIssue * item.unitCost).toLocaleString()}
                                    </td>

                                    {/* Delete Button */}
                                    <td className="p-3 pr-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.id)}
                                            disabled={items.length === 1}
                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};