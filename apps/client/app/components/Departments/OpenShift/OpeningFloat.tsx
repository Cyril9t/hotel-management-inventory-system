import React from 'react';
import { Banknote } from 'lucide-react';

export interface ShiftCashInputProps {
    openingCash: string;
    suggestedCashLoading: boolean;
    suggestedCashError: string | null;
    onOpeningCashChange: (value: string) => void;
}

export const ShiftCashInputSection: React.FC<ShiftCashInputProps> = ({
    openingCash,
    suggestedCashLoading,
    suggestedCashError,
    onOpeningCashChange,
}) => (
    <div className="mt-10 space-y-5">
        <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-sm">
                <label htmlFor="opening-cash" className="flex items-center justify-between text-sm font-bold text-foreground">
                    <span className="flex items-center gap-2"><Banknote className="h-5 w-5 text-primary" />Opening Cash</span>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-primary">Required</span>
                </label>
                <div className="relative pt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pt-1 text-xl font-bold">₦</span>
                    <input
                        id="opening-cash"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={openingCash}
                        disabled={suggestedCashLoading}
                        onChange={(event) => onOpeningCashChange(event.target.value)}
                        placeholder={suggestedCashLoading ? "Loading suggested amount…" : "Enter opening cash"}
                        className="w-full rounded-[var(--radius)] border border-input bg-card py-2.5 pl-9 pr-4 text-xl font-bold text-foreground placeholder:text-sm placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                </div>
                {suggestedCashLoading ? <p role="status" className="text-[11px] text-muted-foreground">Loading suggested opening cash…</p> : suggestedCashError ? (
                    <p role="alert" className="text-[11px] text-destructive">{suggestedCashError} You can enter the amount manually.</p>
                ) : <p className="text-[11px] text-muted-foreground">Suggested opening cash is pre-filled from your previous closed shift and can be edited to match physical handover cash from the previous shift.</p>}
            </div>
        </div>
    </div>
);
