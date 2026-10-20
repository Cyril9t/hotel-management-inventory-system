import React from 'react';
import { AlertCircle, CheckCircle2, DollarSign, MoveRight } from 'lucide-react';

export interface ReconciliationProps {
    openingCash: number;
    totalCashCollected: number;
    expectedCash: number;
    actualCash: number;
    variance: number;
    onActualCashChange: (value: number) => void;
    showWarning: boolean;
}

export const ShiftReconciliationCard: React.FC<ReconciliationProps> = ({
    openingCash,
    totalCashCollected,
    expectedCash,
    actualCash,
    variance,
    onActualCashChange,
    showWarning,
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value;
        if (rawVal === '') {
            onActualCashChange(0);
            return;
        }
        const num = parseFloat(rawVal);
        if (!isNaN(num)) {
            onActualCashChange(num);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Cash Reconciliation
                </h3>
                <span className="text-[13px] font-medium text-muted-foreground">
                    Opening Float + Cash Sales
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Opening Cash
                    </span>
                    <p className="mt-1 text-lg font-bold text-brand-success">
                        ₦ {openingCash.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Cash Collected on duty
                    </span>
                    <p className="mt-1 text-lg font-bold text-foreground">
                        ₦ {totalCashCollected.toLocaleString()}
                    </p>
                </div>
            </div>


            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground flex gap-2">Expected Cash in Drawer <MoveRight /> </span>
                    <span className="font-bold text-base text-brand-navy-light">
                        ₦ {expectedCash.toLocaleString()}
                    </span>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground ">
                        Counted Physical Cash (₦)
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 top-2.5 left-0 flex items-center pl-3 text-muted-foreground font-semibold text-[14px]">
                            ₦
                        </span>
                        <input
                            type="number"
                            max={expectedCash}
                            value={actualCash === 0 ? '' : actualCash}
                            onChange={handleInputChange}
                            placeholder={`Max ₦${expectedCash.toLocaleString()}`}
                            className="mt-2 w-full h-12 pl-8 pr-3.5 py-2 text-sm font-semibold rounded-(--radius) border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        />
                    </div>
                </div>

                {/* Warning Indicator */}
                {showWarning && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-destructive animate-in fade-in duration-200">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Actual cash cannot exceed the expected drawer cash (₦{expectedCash.toLocaleString()}).</span>
                    </div>
                )}

                {/* Variance Display */}
                <div className="flex items-center justify-between rounded-lg border border-border/80 bg-secondary/50 p-3 text-xs">
                    <span className="font-semibold text-muted-foreground">Variance (Shortage / Balanced):</span>
                    <div className="flex items-center gap-1.5 font-bold font-serif text-sm">
                        {variance === 0 ? (
                            <span className="text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> ₦ 0 (Balanced)
                            </span>
                        ) : (
                            <span className="text-destructive">
                                - ₦ {Math.abs(variance).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};