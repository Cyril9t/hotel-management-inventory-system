import { useEffect, useState } from 'react';
import { Play, Lock } from 'lucide-react';
import { StaffIdentityCard } from './identityCard';
import { ShiftCashInputSection } from './OpeningFloat';
import OpenHeader from './OpenHeader';
import { Button } from '~/components/ui/button';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { UseMetricCards, getDashboardPathForRole } from '~/Context/Context';
import GlobalLoadingSkeleton from '~/components/shared/LoadingState/LoadingState';
import { toast } from 'sonner';
import { logShiftApiFailure } from '~/services/shifts';

function errorMessage(error: any) {
    return error?.response?.data?.error?.message ?? error?.message ?? 'Could not open the shift. Please try again.';
}

export const OpenShiftContainer: React.FC = () => {
    const {
        token, user, authLoading, authUnavailable, currentShift, currentShiftLoading,
        currentShiftError, refreshCurrentShift, loadSuggestedOpeningCash, startShift, retrySession,
    } = UseMetricCards();
    const [openingCash, setOpeningCash] = useState('');
    const [suggestedCashLoading, setSuggestedCashLoading] = useState(false);
    const [suggestedCashError, setSuggestedCashError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const dashboardPath = getDashboardPathForRole(user?.role);
    const requestedReturnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
    const returnTo = typeof requestedReturnTo === 'string' && dashboardPath &&
        (requestedReturnTo === dashboardPath || requestedReturnTo.startsWith(`${dashboardPath}/`))
        ? requestedReturnTo
        : dashboardPath;

    useEffect(() => {
        if (!token || authLoading || currentShiftLoading || currentShift || currentShiftError) return;
        let cancelled = false;
        setSuggestedCashLoading(true);
        setSuggestedCashError(null);
        void loadSuggestedOpeningCash().then((amount: number) => {
            if (!cancelled) setOpeningCash(String(amount));
        }).catch((error: unknown) => {
            logShiftApiFailure('GET /shifts/suggested-opening-cash', error);
            if (!cancelled) setSuggestedCashError(error instanceof Error ? error.message : 'Could not load suggested opening cash.');
        }).finally(() => {
            if (!cancelled) setSuggestedCashLoading(false);
        });
        return () => { cancelled = true; };
    }, [token, authLoading, currentShiftLoading, currentShift, currentShiftError, loadSuggestedOpeningCash]);

    if (authLoading || currentShiftLoading) return <div role="status" className="p-6"><GlobalLoadingSkeleton /></div>;
    if (authUnavailable) return <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-muted-foreground">The authentication service is temporarily unavailable. Your saved session remains intact.</p>
        <Button type="button" onClick={() => { void retrySession(); }}>Retry session restoration</Button>
    </div>;
    if (!token || !user) return <Navigate to="/" replace />;
    if (!dashboardPath || !['/receptionist/dashboard', '/bar/dashboard'].includes(dashboardPath)) return <Navigate to={dashboardPath ?? '/'} replace />;
    if (currentShift) return <Navigate to={returnTo ?? dashboardPath} replace />;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const amount = Number(openingCash);
        if (openingCash.trim() === '' || !Number.isFinite(amount) || amount < 0) {
            setSubmitError('Enter a valid opening cash amount of zero or more.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        try {
            const result = await startShift(amount);
            if (!result?.shift) throw new Error('The shift was not returned by the server. Refresh the current shift and try again.');
            if (result.alreadyOpen) toast.info('You already have an open shift.');
            else toast.success('Shift opened successfully.');
            navigate(returnTo ?? dashboardPath, { replace: true });
        } catch (error) {
            logShiftApiFailure('POST /shifts/open', error);
            setSubmitError(errorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (currentShiftError) return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-destructive">{currentShiftError}</p>
        <Button type="button" onClick={() => { void refreshCurrentShift().catch(() => {}); }}>Retry current shift</Button>
    </div>;

    const fullName = [user.firstName, user.lastName].filter((part): part is string => typeof part === 'string' && part.length > 0).join(' ') || 'Authenticated staff member';
    const department = typeof user.department === 'string' ? user.department : String(user.role ?? 'Staff');
    const openingTimestamp = new Date().toLocaleString();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[black]/30 p-4 backdrop-blur-sm md:p-8">
            <div className="absolute p-5 flex max-h-[95vh] w-full max-w-4xl flex-col overflow-y-auto rounded-[var(--radius)] border border-border bg-card shadow-2xl">
                <OpenHeader />
                <form onSubmit={handleSubmit} className="mt-8">
                    <StaffIdentityCard
                        staffName={fullName}
                        department={department}
                        role={String(user.role ?? 'Staff')}
                        openingTimestamp={openingTimestamp}
                    />
                    <ShiftCashInputSection
                        openingCash={openingCash}
                        suggestedCashLoading={suggestedCashLoading}
                        suggestedCashError={suggestedCashError}
                        onOpeningCashChange={(value) => { setOpeningCash(value); setSubmitError(''); }}
                    />
                    {submitError && <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
                    <div className="flex items-center justify-between gap-3 border-border pt-6">
                        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 text-primary" />
                            <span>Opening cash will be recorded for this shift.</span>
                        </div>
                        <Button type="submit" disabled={isSubmitting || suggestedCashLoading} className="h-10 min-w-48">
                            {isSubmitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /><span>Opening shift…</span></> : <><Play className="h-4 w-4 fill-current" /><span>Open Shift</span></>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OpenShiftContainer;
