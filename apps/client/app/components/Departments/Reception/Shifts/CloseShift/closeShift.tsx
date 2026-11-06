import { Lock, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { UseMetricCards } from '~/Context/Context';
import GlobalLoadingSkeleton from '~/components/shared/LoadingState/LoadingState';
import { CloseShiftHeader } from './header';
import { ShiftReconciliationCard } from './shiftCard';
import { logShiftApiFailure } from '~/services/shifts';
import { getShiftCashPayments } from '~/services/payments';
import { useAuth } from '~/Context/AuthContext';
import { useShift } from '~/Context/ShiftContext';

export interface CloseShiftContainerProps {
    isOpen?: boolean;
    onClose?: () => void;
    onShiftClosed?: (summary: unknown) => void;
}

function displayKey(key: string) {
    return key.replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown) {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return '';
}

export const CloseShift: React.FC<CloseShiftContainerProps> = ({ isOpen = true, onClose, onShiftClosed }) => {
    const { api } = UseMetricCards();
    const { currentShift, currentShiftLoading, currentShiftError, refreshCurrentShift, finishShift, loadShiftDetails, shiftDetails } = useShift();
    const { user, clearSession } = useAuth();
    const [actualCash, setActualCash] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const [cashPaymentsReceived, setCashPaymentsReceived] = useState<number | null>(null);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsError, setPaymentsError] = useState('');
    const navigate = useNavigate();
    const shiftId = currentShift?.id;
    const details = shiftId ? shiftDetails[shiftId] : undefined;

    useEffect(() => {
        setActualCash('');
        setSubmitError('');
    }, [shiftId]);

    useEffect(() => {
        if (!shiftId || shiftDetails[shiftId]) return;
        let cancelled = false;
        setDetailsLoading(true);
        setDetailsError('');
        void loadShiftDetails(shiftId).catch((error: any) => {
            if (!cancelled) setDetailsError(error?.response?.data?.error?.message ?? 'Could not load shift details.');
        }).finally(() => {
            if (!cancelled) setDetailsLoading(false);
        });
        return () => { cancelled = true; };
    }, [shiftId, shiftDetails, loadShiftDetails]);

    useEffect(() => {
        if (!shiftId) return;
        let cancelled = false;
        setPaymentsLoading(true);
        setPaymentsError('');
        setCashPaymentsReceived(null);
        void getShiftCashPayments(api, shiftId).then((amount) => {
            if (!cancelled) setCashPaymentsReceived(amount);
        }).catch((error: any) => {
            if (!cancelled) setPaymentsError(error?.response?.data?.error?.message ?? error?.message ?? 'Could not load cash payments received.');
        }).finally(() => {
            if (!cancelled) setPaymentsLoading(false);
        });
        return () => { cancelled = true; };
    }, [api, shiftId]);

    if (!isOpen) return null;
    if (currentShiftLoading) return <div role="status" className="p-6"><GlobalLoadingSkeleton /></div>;
    if (currentShiftError) return <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-destructive">{currentShiftError}</p>
        <Button type="button" onClick={() => { void refreshCurrentShift().catch(() => {}); }}>Retry current shift</Button>
    </div>;
    if (!currentShift) return <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">There is no active shift to close.</p>
        <Button type="button" onClick={() => navigate('/OpenShift')}>Open a shift</Button>
    </div>;

    const fullName = [user?.firstName, user?.lastName].filter((part): part is string => typeof part === 'string' && part.length > 0).join(' ') || 'Authenticated staff member';
    const department = typeof user?.department === 'string' ? user.department : String(user?.role ?? 'Staff');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const amount = Number(actualCash);
        if (actualCash.trim() === '' || !Number.isFinite(amount) || amount < 0) {
            setSubmitError('Enter a valid actual cash amount of zero or more.');
            return;
        }
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const result = await finishShift(amount);
            onShiftClosed?.(result);
            const closedShift = (result as { shift?: Record<string, unknown> } | null)?.shift;
            const logoutConfirmed = await clearSession();
            const variance = closedShift?.variance;
            if (logoutConfirmed) toast.success('Shift closed successfully. You have been logged out.', {
                description: typeof variance === 'string' ? `Cash variance: ₦ ${Number(variance).toLocaleString()}` : undefined,
            });
            else toast.error('Shift closed and your local session was cleared, but the server could not confirm logout.');
            onClose?.();
            navigate('/', { replace: true });
        } catch (error: any) {
            logShiftApiFailure(`PATCH /shifts/${shiftId}/close`, error);
            setSubmitError(error?.response?.status === 404
                ? 'The active shift was not found. Current shift information has been refreshed.'
                : error?.response?.data?.error?.message ?? error?.message ?? 'Could not close the shift. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const detailFields = details ? Object.entries(details)
        .filter(([key, value]) => key !== 'id' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) : [];

    return (
        <div className="">
            <CloseShiftHeader staffName={fullName} department={department} shiftId={currentShift.id} />
            <form onSubmit={handleSubmit} className="mt-10 flex-1 overflow-y-auto">
                {detailsLoading && <div role="status" className="mb-4 h-24 animate-pulse rounded-xl bg-muted" />}
                {detailsError && <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{detailsError}</p>}
                {detailFields.length > 0 && <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-lg font-bold text-foreground">Shift details</h3>
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {detailFields.map(([key, value]) => <div key={key} className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{displayKey(key)}</dt>
                            <dd className="mt-1 break-words text-sm font-medium text-foreground">{displayValue(value)}</dd>
                        </div>)}
                    </dl>
                </section>}
                <ShiftReconciliationCard
                    actualCash={actualCash}
                    onActualCashChange={(value) => { setActualCash(value); setSubmitError(''); }}
                    openingCash={currentShift.openingCash == null ? null : Number(currentShift.openingCash)}
                    cashPaymentsReceived={cashPaymentsReceived}
                    expectedCash={details?.expectedCash == null ? (currentShift.expectedCash == null ? null : Number(currentShift.expectedCash)) : Number(details.expectedCash)}
                    paymentsLoading={paymentsLoading}
                />
                {paymentsError && <p role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{paymentsError}</p>}
                {details?.variance != null && <p className="mt-3 text-sm text-muted-foreground">Server calculated variance: ₦ {Number(details.variance).toLocaleString()}</p>}
                {submitError && <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
                <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" /><span>Shift close is recorded by the server.</span></div>
                    <div className="flex w-full justify-end gap-3 sm:w-auto">
                        {onClose && <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>}
                        <Button type="submit" disabled={isSubmitting} className="h-10 w-50">
                            {isSubmitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /><span>Closing shift…</span></> : <><Lock className="h-4 w-4" /><span>Confirm &amp; Close Shift</span></>}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CloseShift;
