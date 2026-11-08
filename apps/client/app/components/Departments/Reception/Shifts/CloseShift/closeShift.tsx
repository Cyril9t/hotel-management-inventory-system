import { Lock, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { UseMetricCards } from '~/Context/Context';
import GlobalLoadingSkeleton from '~/components/shared/LoadingState/LoadingState';
import { CloseShiftHeader } from './header';
import { ShiftReconciliationCard } from './shiftCard';
import { asShiftRecord, logShiftApiFailure } from '~/services/shifts';
import { getShiftCashPayments } from '~/services/payments';
import { useAuth } from '~/Context/AuthContext';
import { useShift } from '~/Context/ShiftContext';

export interface CloseShiftContainerProps {
    isOpen?: boolean;
    onClose?: () => void;
    onShiftClosed?: (summary: unknown) => void;
}

export const CloseShift: React.FC<CloseShiftContainerProps> = ({ isOpen = true, onClose, onShiftClosed }) => {
    const { api } = UseMetricCards();
    const { currentShift, currentShiftLoading, currentShiftError, refreshCurrentShift, finishShift } = useShift();
    const { user, clearSession } = useAuth();
    const [actualCash, setActualCash] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [cashPaymentsReceived, setCashPaymentsReceived] = useState<number | null>(null);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsError, setPaymentsError] = useState('');
    const [paymentsRetryKey, setPaymentsRetryKey] = useState(0);
    const navigate = useNavigate();
    const shiftId = currentShift?.id;
    const shiftOpenedAt = currentShift?.openedAt;

    useEffect(() => {
        if (isOpen) void refreshCurrentShift().catch(() => {});
    }, [isOpen, refreshCurrentShift]);

    useEffect(() => {
        setActualCash('');
        setSubmitError('');
    }, [shiftId]);

    useEffect(() => {
        if (!isOpen) return;
        if (!shiftId || !shiftOpenedAt) {
            setCashPaymentsReceived(null);
            setPaymentsError(shiftId ? 'The current shift is missing its opening timestamp.' : '');
            setPaymentsLoading(false);
            return;
        }
        let cancelled = false;
        setPaymentsLoading(true);
        setPaymentsError('');
        setCashPaymentsReceived(null);
        void getShiftCashPayments(api, shiftId, shiftOpenedAt).then((amount) => {
            if (!cancelled) setCashPaymentsReceived(amount);
        }).catch((error: any) => {
            if (!cancelled) setPaymentsError(error?.response?.data?.error?.message ?? error?.message ?? 'Could not load recorded cash payments.');
        }).finally(() => {
            if (!cancelled) setPaymentsLoading(false);
        });
        return () => { cancelled = true; };
    }, [api, isOpen, shiftId, shiftOpenedAt, paymentsRetryKey]);

    if (!isOpen) return null;
    if (currentShiftLoading && !currentShift) return <div role="status" className="p-6"><GlobalLoadingSkeleton /></div>;
    if (currentShiftError && !currentShift) return <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-destructive">{currentShiftError}</p>
        <Button type="button" onClick={() => { void refreshCurrentShift().catch(() => {}); }}>Retry current shift</Button>
    </div>;
    if (!currentShift) return <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">There is no active shift to close.</p>
        <Button type="button" onClick={() => navigate('/OpenShift')}>Open a shift</Button>
    </div>;

    const activeShift = currentShift;
    const fullName = [user?.firstName, user?.lastName].filter((part): part is string => typeof part === 'string' && part.length > 0).join(' ') || 'Authenticated staff member';
    const department = typeof user?.department === 'string' ? user.department : String(user?.role ?? 'Staff');
    const openingValue = activeShift.openingCash;
    const openingCash = openingValue !== null && openingValue !== undefined && String(openingValue).trim() !== '' && Number.isFinite(Number(openingValue)) && Number(openingValue) >= 0
        ? Number(openingValue)
        : null;
    const expectedValue = activeShift.expectedCash;
    const expectedCash = expectedValue !== null && expectedValue !== undefined && String(expectedValue).trim() !== '' && Number.isFinite(Number(expectedValue)) && Number(expectedValue) >= 0
        ? Number(expectedValue)
        : null;
    const businessExpectedCash = openingCash !== null && Number.isFinite(openingCash) && cashPaymentsReceived !== null
        ? openingCash + cashPaymentsReceived
        : null;
    const serverExpectedMismatch = expectedCash !== null && businessExpectedCash !== null && Math.round(expectedCash * 100) !== Math.round(businessExpectedCash * 100);
    const expectedCashError = currentShiftError ?? (expectedCash === null
        ? 'The current shift did not return a valid Expected Cash value.'
        : openingCash === null
            ? 'The current shift did not return a valid Opening Cash value.'
            : null);
    const reconciliationReady = !currentShiftLoading && !currentShiftError && expectedCash !== null && openingCash !== null &&
        cashPaymentsReceived !== null && !paymentsLoading && !paymentsError && !serverExpectedMismatch;
    const isActualCashValid = actualCash.trim() !== '' && Number.isFinite(Number(actualCash)) && Number(actualCash) >= 0;
    const exceedsExpectedCash = expectedCash !== null && isActualCashValid && Number(actualCash) > expectedCash;
    const isFormValid = reconciliationReady &&
        isActualCashValid && !exceedsExpectedCash && !currentShiftLoading && !isSubmitting;

    const handleRetryReconciliation = () => {
        setSubmitError('');
        setPaymentsRetryKey((key) => key + 1);
        void refreshCurrentShift().catch(() => {});
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isSubmitting) return;
        if (expectedCash === null || cashPaymentsReceived === null || paymentsLoading || paymentsError) {
            setSubmitError('Expected cash and recorded cash payments must be available before closing this shift.');
            return;
        }
        if (!isActualCashValid) {
            setSubmitError('Enter a valid actual cash amount of zero or more.');
            return;
        }
        const amount = Number(actualCash);
        if (amount > expectedCash) {
            setSubmitError(`Actual cash cannot exceed the server Expected Cash of ₦ ${expectedCash.toLocaleString()}.`);
            return;
        }
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const result = await finishShift(amount);
            const closedShift = asShiftRecord(result);
            onShiftClosed?.(closedShift ?? result);

            // finishShift clears the active shift only after PATCH /shifts/{id}/close succeeds.
            const logoutConfirmed = await clearSession();
            const varianceValue = closedShift?.variance == null ? null : Number(closedShift.variance);
            const varianceDescription = varianceValue !== null && Number.isFinite(varianceValue)
                ? `Cash variance: ₦ ${varianceValue.toLocaleString()}`
                : undefined;
            if (logoutConfirmed) toast.success('Shift closed successfully. You have been logged out.', { description: varianceDescription });
            else toast.warning('Shift closed and local session cleared, but server logout could not be verified.', { description: varianceDescription });
            onClose?.();
            navigate('/', { replace: true });
        } catch (error: any) {
            logShiftApiFailure(`PATCH /shifts/${activeShift.id}/close`, error);
            setSubmitError(error?.response?.data?.error?.message ?? error?.message ?? 'Could not close the shift. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return <div>
        <CloseShiftHeader staffName={fullName} department={department} shiftId={activeShift.id} />
        <form onSubmit={handleSubmit} className="mt-10 flex-1 overflow-y-auto">
            <ShiftReconciliationCard
                actualCash={actualCash}
                onActualCashChange={(value) => { setActualCash(value); setSubmitError(''); }}
                openingCash={Number.isFinite(openingCash) ? openingCash : null}
                cashPaymentsReceived={cashPaymentsReceived}
                expectedCash={expectedCash}
                isExpectedCashLoading={currentShiftLoading}
                expectedCashError={expectedCashError}
                onRetryExpectedCash={handleRetryReconciliation}
                paymentsLoading={paymentsLoading}
                paymentsError={paymentsError}
                onRetryPayments={() => setPaymentsRetryKey((key) => key + 1)}
                serverExpectedMismatch={serverExpectedMismatch}
                businessExpectedCash={businessExpectedCash}
                reconciliationReady={reconciliationReady}
                disabled={isSubmitting}
            />
            {exceedsExpectedCash && <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">Actual cash cannot exceed the server Expected Cash of ₦ {expectedCash?.toLocaleString()}.</p>}
            {submitError && <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" /><span>Shift close is recorded by the server.</span></div>
                <div className="flex w-full justify-end gap-3 sm:w-auto">
                    {onClose && <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>}
                    {reconciliationReady && <Button type="submit" disabled={!isFormValid || isSubmitting} className="h-10 w-50">
                        {isSubmitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /><span>Closing shift…</span></> : <><Lock className="h-4 w-4" /><span>Confirm &amp; Close Shift</span></>}
                    </Button>}
                </div>
            </div>
        </form>
    </div>;
};

export default CloseShift;
