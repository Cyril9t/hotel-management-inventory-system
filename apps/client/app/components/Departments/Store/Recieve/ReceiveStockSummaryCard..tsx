import React from 'react';
import { PackageCheck, Save, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export interface SummaryProps {
    totalLineItems: number;
    totalQuantity: number;
    subtotalCost: number;
    taxAmount: number;
    grandTotalCost: number;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export const ReceiveStockSummaryCard: React.FC<SummaryProps> = ({
    totalLineItems,
    totalQuantity,
    subtotalCost,
    taxAmount,
    grandTotalCost,
    onSubmit,
    isSubmitting = false,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-primary" />
                    <span>GRN Cost Valuation Summary</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Total Product Lines</span>
                        <span className="font-bold text-foreground font-mono">{totalLineItems} Items</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Total Units Received</span>
                        <span className="font-bold text-foreground font-mono">{totalQuantity} Units</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Subtotal (Excl. Tax)</span>
                        <span className="  font-bold text-foreground">₦ {subtotalCost.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>VAT / Tax (7.5%)</span>
                        <span className="  font-bold text-muted-foreground">₦ {taxAmount.toLocaleString()}</span>
                    </div>

                    <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-bold">
                        <span className="text-foreground">Grand Total Ledger Value</span>
                        <span className="  text-primary text-base">₦ {grandTotalCost.toLocaleString()}</span>
                    </div>
                </div>

                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Posting will immediately update central store quantities & stock valuation.</span>
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting || totalQuantity === 0}
                    className="w-full py-3 px-4 text-xs font-semibold rounded-[var(--radius)] bg-primary text-primary-foreground shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Posting GRN to Ledger...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Post Stock to Central Ledger</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};