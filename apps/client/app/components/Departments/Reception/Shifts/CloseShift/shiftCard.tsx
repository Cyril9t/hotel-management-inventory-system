import React from 'react';
import { Banknote, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';

export interface ReconciliationProps {
    actualCash: string;
    onActualCashChange: (value: string) => void;
    openingCash: number | null;
    cashPaymentsReceived: number | null;
    expectedCash: number | null;
    isExpectedCashLoading: boolean;
    expectedCashError?: string | null;
    onRetryExpectedCash?: () => void;
    paymentsLoading?: boolean;
    paymentsError?: string | null;
    onRetryPayments?: () => void;
    serverExpectedMismatch?: boolean;
    businessExpectedCash?: number | null;
    reconciliationReady: boolean;
    disabled?: boolean;
}

const formatAmount = (amount: number | null) => amount === null
    ? 'Unavailable'
    : `₦ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ShiftReconciliationCard: React.FC<ReconciliationProps> = ({
    actualCash,
    onActualCashChange,
    openingCash,
    cashPaymentsReceived,
    expectedCash,
    isExpectedCashLoading,
    expectedCashError,
    onRetryExpectedCash,
    paymentsLoading = false,
    paymentsError,
    onRetryPayments,
    serverExpectedMismatch = false,
    businessExpectedCash,
    reconciliationReady,
    disabled = false,
}) => {
    const actualNum = actualCash.trim() !== '' && Number.isFinite(Number(actualCash)) && Number(actualCash) >= 0
        ? Number(actualCash)
        : null;
    const variance = actualNum !== null && expectedCash !== null ? expectedCash - actualNum : null;
    const isBalanced = variance !== null && variance === 0;
    const isShortage = variance !== null && variance > 0;
    const isOver = variance !== null && variance < 0;
    const isInputDisabled = disabled || !reconciliationReady || isExpectedCashLoading || expectedCash === null || paymentsLoading || Boolean(paymentsError) || cashPaymentsReceived === null;

    return <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm" aria-labelledby="cash-reconciliation-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <h3 id="cash-reconciliation-title" className="flex items-center gap-2 text-xl font-bold text-foreground"><Banknote className="h-5 w-5 text-primary" />Cash Reconciliation</h3>
            <span className="text-sm font-medium text-muted-foreground">Current shift</span>
        </div>

        {expectedCashError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <span>{expectedCashError}</span>
            {onRetryExpectedCash && <Button type="button" variant="outline" size="sm" onClick={onRetryExpectedCash} className="gap-2"><RefreshCw className="h-3.5 w-3.5" />Retry shift</Button>}
        </div>}
        {paymentsError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <span>Recorded cash payments could not be loaded: {paymentsError}</span>
            {onRetryPayments && <Button type="button" variant="outline" size="sm" onClick={onRetryPayments} className="gap-2"><RefreshCw className="h-3.5 w-3.5" />Retry payments</Button>}
        </div>}

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3"><dt className="text-xs font-semibold text-muted-foreground">Opening Cash</dt><dd className="mt-1 font-semibold text-foreground">{formatAmount(openingCash)}</dd></div>
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3"><dt className="text-xs font-semibold text-muted-foreground">Cash Payments Received</dt><dd className="mt-1 font-semibold text-foreground">{paymentsLoading ? 'Loading…' : formatAmount(cashPaymentsReceived)}</dd></div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3"><dt className="text-xs font-semibold text-primary">Expected Cash</dt><dd className="mt-1 font-semibold text-foreground">{isExpectedCashLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading…</span> : formatAmount(expectedCash)}</dd></div>
        </dl>

        {serverExpectedMismatch && expectedCash !== null && businessExpectedCash != null && <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-900 dark:text-amber-200">
            <p className="font-semibold">Backend reconciliation mismatch</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3"><p className="text-xs">The API returned Expected Cash {formatAmount(expectedCash)}, while Opening Cash plus recorded cash payments is {formatAmount(businessExpectedCash)}. The backend must include opening cash in both expected cash and close validation. This screen uses the API value for the close limit.</p>{onRetryExpectedCash && <Button type="button" variant="outline" size="sm" onClick={onRetryExpectedCash} className="gap-2"><RefreshCw className="h-3.5 w-3.5" />Retry reconciliation</Button>}</div>
        </div>}

        <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="actual-cash" className="text-sm font-semibold text-foreground">Actual Cash Count (₦)</label>
                {expectedCash !== null && <span className="text-xs text-muted-foreground">Maximum permitted by API: {formatAmount(expectedCash)}</span>}
            </div>
            <input id="actual-cash" type="number" min="0" max={expectedCash ?? undefined} step="0.01" required disabled={isInputDisabled} value={actualCash} onChange={(event) => onActualCashChange(event.target.value)} placeholder={isInputDisabled ? 'Reconciliation data unavailable' : 'Enter physical cash counted in drawer'} aria-invalid={isOver} className={`h-12 w-full rounded-[var(--radius)] border px-3.5 py-2 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-50 ${isOver ? 'border-destructive focus:ring-destructive' : 'border-input bg-card focus:ring-ring'}`} />
            {isOver && <p role="alert" className="text-sm text-destructive">Actual cash cannot exceed Expected Cash ({formatAmount(expectedCash)}).</p>}
        </div>

        {variance !== null && <div className={`rounded-lg border p-3.5 ${isBalanced ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : isShortage ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
            <div className="flex items-start gap-2.5">
                {isBalanced ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : isShortage ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
                <div>
                    <p className="text-sm font-semibold">Cash Variance: {formatAmount(variance)}</p>
                    <p className="text-xs opacity-90">Expected Cash ({formatAmount(expectedCash)}) − Actual Cash ({formatAmount(actualNum)}). {isShortage ? 'Positive variance is a cash shortage.' : isBalanced ? 'The drawer is balanced.' : 'Actual cash exceeds the API close limit.'}</p>
                </div>
            </div>
        </div>}
    </section>;
};
