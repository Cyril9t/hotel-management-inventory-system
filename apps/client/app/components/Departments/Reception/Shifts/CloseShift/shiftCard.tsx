import { Banknote } from 'lucide-react';

export interface ReconciliationProps {
    actualCash: string;
    onActualCashChange: (value: string) => void;
    openingCash: number | null;
    cashPaymentsReceived: number | null;
    expectedCash: number | null;
    paymentsLoading: boolean;
}

const formatAmount = (amount: number | null) => amount === null ? 'Unavailable' : `₦ ${amount.toLocaleString()}`;

export const ShiftReconciliationCard: React.FC<ReconciliationProps> = ({ actualCash, onActualCashChange, openingCash, cashPaymentsReceived, expectedCash, paymentsLoading }) => (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="flex items-center gap-2 text-xl font-bold text-foreground"><Banknote className="h-5 w-5 text-primary" />Cash Reconciliation</h3>
            <span className="text-[13px] font-medium text-muted-foreground">Enter the cash counted at shift close</span>
        </div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3"><dt className="text-xs font-semibold text-muted-foreground">Opening Cash</dt><dd className="mt-1 font-semibold text-foreground">{formatAmount(openingCash)}</dd></div>
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3"><dt className="text-xs font-semibold text-muted-foreground">Cash Payments Received</dt><dd className="mt-1 font-semibold text-foreground">{paymentsLoading ? 'Loading…' : formatAmount(cashPaymentsReceived)}</dd></div>
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3"><dt className="text-xs font-semibold text-muted-foreground">Expected Cash</dt><dd className="mt-1 font-semibold text-foreground">{formatAmount(expectedCash)}</dd></div>
        </dl>
        <div className="space-y-2">
            <label htmlFor="actual-cash" className="text-sm font-semibold text-foreground">Actual Cash (₦)</label>
            <input
                id="actual-cash"
                type="number"
                min="0"
                step="0.01"
                required
                value={actualCash}
                onChange={(event) => onActualCashChange(event.target.value)}
                placeholder="Enter actual cash"
                className="mt-2 h-12 w-full rounded-[var(--radius)] border border-input bg-card px-3.5 py-2 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </div>
    </div>
);
