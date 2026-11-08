import React from 'react';
import { Plus, Trash2, Package, Tag, AlertCircle } from 'lucide-react';

export interface ReceivedLineItem {
    id: string;
    productName: string;
    category: 'Drinks' | 'Food' | 'Essentials' | 'General';
    unitOfMeasure: string;
    qtyReceived: number;
    unitCost: number;
    totalCost: number;
    batchNumber?: string;
    expiryDate?: string;
}

export interface TableProps {
    items: ReceivedLineItem[];
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (id: string, field: keyof ReceivedLineItem, value: any) => void;
}

export const ReceivedItemsTable: React.FC<TableProps> = ({
    items,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-3">
            {/* Table Header Controls */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Stock Received Line Items</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Log quantity, cost price in ₦, and batch expiration dates
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onAddItem}
                    className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius)] bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all flex items-center gap-1.5"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product Line</span>
                </button>
            </div>

            {/* Grid Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="p-3 pl-4 min-w-[200px]">Product Description</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 w-28">Unit (Pcs/Btl/Kg)</th>
                            <th className="p-3 w-24">Qty Received</th>
                            <th className="p-3 w-32">Unit Cost (₦)</th>
                            <th className="p-3 w-32">Total Cost (₦)</th>
                            <th className="p-3 w-32">Batch / Expiry</th>
                            <th className="p-3 pr-4 text-right w-12">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-secondary/20 transition-colors">

                                {/* Product Name */}
                                <td className="p-3 pl-4">
                                    <input
                                        type="text"
                                        value={item.productName}
                                        onChange={(e) => onUpdateItem(item.id, 'productName', e.target.value)}
                                        placeholder="e.g. Heineken 60cl, Jasmine Rice 50kg..."
                                        className="w-full px-2.5 py-1.5 rounded border border-input bg-card text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </td>

                                {/* Category */}
                                <td className="p-3">
                                    <select
                                        value={item.category}
                                        onChange={(e) => onUpdateItem(item.id, 'category', e.target.value)}
                                        className="w-full px-2 py-1.5 rounded border border-input bg-card text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="Drinks">Drinks</option>
                                        <option value="Food">Food</option>
                                        <option value="Essentials">Essentials</option>
                                        <option value="General">General</option>
                                    </select>
                                </td>

                                {/* Unit of Measure */}
                                <td className="p-3">
                                    <input
                                        type="text"
                                        value={item.unitOfMeasure}
                                        onChange={(e) => onUpdateItem(item.id, 'unitOfMeasure', e.target.value)}
                                        placeholder="e.g. Bottles, Crates, Bags"
                                        className="w-full px-2 py-1.5 rounded border border-input bg-card text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </td>

                                {/* Qty Received */}
                                <td className="p-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.qtyReceived || ''}
                                        onChange={(e) => onUpdateItem(item.id, 'qtyReceived', parseFloat(e.target.value) || 0)}
                                        className="w-full px-2 py-1.5 rounded border border-input bg-card text-foreground font-mono font-bold focus:outline-none focus:ring-1 focus:ring-ring text-right"
                                    />
                                </td>

                                {/* Unit Cost */}
                                <td className="p-3">
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.unitCost || ''}
                                        onChange={(e) => onUpdateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="w-full px-2 py-1.5 rounded border border-input bg-card text-foreground font-mono font-bold focus:outline-none focus:ring-1 focus:ring-ring text-right"
                                    />
                                </td>

                                {/* Calculated Total Cost */}
                                <td className="p-3   font-bold text-primary text-right pr-2">
                                    ₦ {(item.qtyReceived * item.unitCost).toLocaleString()}
                                </td>

                                {/* Expiry Date */}
                                <td className="p-3">
                                    <input
                                        type="date"
                                        value={item.expiryDate || ''}
                                        onChange={(e) => onUpdateItem(item.id, 'expiryDate', e.target.value)}
                                        className="w-full px-2 py-1 rounded border border-input bg-card text-muted-foreground text-[10px] focus:outline-none"
                                    />
                                </td>

                                {/* Delete Row */}
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};