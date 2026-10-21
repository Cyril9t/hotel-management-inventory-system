import React from 'react';
import { Banknote, ArrowRightLeft, PackageCheck, Sparkles } from 'lucide-react';

export interface ShiftCashInputProps {
    openingCash: number;
    handoverAmount: number;
    onOpeningCashChange: (value: number) => void;
    onHandoverChange: (value: number) => void;
}

export const ShiftCashInputSection: React.FC<ShiftCashInputProps> = ({
    openingCash,
    handoverAmount,
    onOpeningCashChange,
    onHandoverChange,
}) => {
    return (
        <div className="space-y-5 mt-10">

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-secondary/30 text-xs">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-md bg-brand-success/10 text-brand-success">
                        <PackageCheck size={30} />
                    </div>
                    <div>
                        <span className="font-semibold text-xl text-foreground">Inventory Snapshot</span>
                        <p className="text-[15px] text-muted-foreground">Opening stock counts will be captured automatically upon shift launch.</p>
                    </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-success/10 text-brand-success border border-brand-navy-light">
                    <Sparkles className="w-3 h-3" /> Auto Snapshot Enabled
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-primary" />
                            Expected Cash Form outgoing staff
                        </span>
                        <span className="text-[12px] font-semibold uppercase tracking-wider text-primary">Calculated</span>
                    </label>

                    <div className="relative pt-1">
                        <span className="absolute inset-y-0 top-1 left-0 pl-3.5 flex items-center font-bold text-xl">
                            ₦
                        </span>
                        <div className="w-full pl-9 pr-4 py-2.5 text-xl font-bold  rounded-(--radius) border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        >{openingCash}</div>

                    </div>
                    <p className="text-[13px] text-muted-foreground">Physical drawer balance verified at the desk by the outgoing staff</p>
                </div>


                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-primary" />
                            Handover Cash
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Required</span>
                    </label>

                    <div className="relative pt-1">
                        <span className="absolute inset-y-0 top-1 left-0 pl-3.5 flex items-center font-bold text-xl text-brand-navy-light">
                            ₦
                        </span>
                        <input
                            type="number"
                            min={0}
                            value={handoverAmount || ''}
                            onChange={(e) => onHandoverChange(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full pl-9 pr-4 py-2.5 text-xl font-bold rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Direct cash received from outgoing staff.</p>
                </div>

            </div>
        </div>
    );
};