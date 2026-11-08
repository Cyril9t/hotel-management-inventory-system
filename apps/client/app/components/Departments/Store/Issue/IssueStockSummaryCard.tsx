import React from 'react';
import { ArrowUpRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export interface SummaryProps {
    totalLineItems: number;
    totalQuantity: number;
    totalValuation: number;
    targetDepartment: string;
    requestedBy: string;
    hasErrors: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export const IssueStockSummaryCard: React.FC<SummaryProps> = ({
    totalLineItems,
    totalQuantity,
    totalValuation,
    targetDepartment,
    requestedBy,
    hasErrors,
    onSubmit,
    isSubmitting = false,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                    <span>Stock Transfer Summary</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Target Department</span>
                        <span className="font-bold text-foreground">{targetDepartment || 'Not Selected'}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Recipient Officer</span>
                        <span className="font-bold text-foreground">{requestedBy || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Transfer Line Items</span>
                        <span className="font-bold text-foreground font-mono">{totalLineItems} Items</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Total Units Issued</span>
                        <span className="font-bold text-foreground font-mono">{totalQuantity} Units</span>
                    </div>

                    <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-bold">
                        <span className="text-foreground">Charged Valuation</span>
                        <span className="  text-primary text-base">₦ {totalValuation.toLocaleString()}</span>
                    </div>
                </div>

                {hasErrors ? (
                    <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-[11px] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Resolve quantity limits before confirming stock issue.</span>
                    </div>
                ) : (
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Posting will immediately deduct Main Store stock & update department ledger.</span>
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-2">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting || totalQuantity === 0 || hasErrors}
                    className="w-full py-3 px-4 text-xs font-semibold rounded-[var(--radius)] bg-primary text-primary-foreground shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Deducting & Transferring Stock...</span>
                        </>
                    ) : (
                        <>
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Confirm & Issue to Department</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};