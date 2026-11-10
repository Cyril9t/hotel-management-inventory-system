import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "~/lib/api";
import { getReceptionBookingPayments, type RecordedBookingPayment } from "~/services/payments";
import { aggregateReceptionRevenue, type RevenueBucket, type RevenuePeriod } from "~/services/revenue";
type RevenueContextValue = {
    period: RevenuePeriod;
    setPeriod: (period: RevenuePeriod) => void;
    total: number;
    buckets: RevenueBucket[];
    loading: boolean;
    error: string;
    retry: () => void;
};

const RevenueContext = createContext<RevenueContextValue | null>(null);

export function ReceptionRevenueProvider({ children }: { children: ReactNode }) {
    const [period, setPeriod] = useState<RevenuePeriod>("daily");
    const [payments, setPayments] = useState<RecordedBookingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryVersion, setRetryVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        getReceptionBookingPayments(api)
            .then((nextPayments) => { if (!cancelled) setPayments(nextPayments); })
            .catch((requestError: any) => {
                if (cancelled) return;
                setPayments([]);
                setError(requestError?.response?.data?.error?.message ?? requestError?.message ?? "Could not load Reception payment records.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [retryVersion]);

    const result = useMemo(() => {
        try {
            return { ...aggregateReceptionRevenue(payments, period, new Date()), aggregationError: "" };
        } catch (aggregationError: any) {
            return { total: 0, buckets: [] as RevenueBucket[], aggregationError: aggregationError?.message ?? "Could not calculate Reception revenue." };
        }
    }, [payments, period]);

    const retry = useCallback(() => setRetryVersion((version) => version + 1), []);
    const value = useMemo<RevenueContextValue>(() => ({
        period,
        setPeriod,
        total: result.total,
        buckets: result.buckets,
        loading,
        error: error || result.aggregationError,
        retry,
    }), [period, result, loading, error, retry]);

    return <RevenueContext.Provider value={value}>{children}</RevenueContext.Provider>;
}

export function useReceptionRevenue() {
    const context = useContext(RevenueContext);
    if (!context) throw new Error("useReceptionRevenue must be used inside ReceptionRevenueProvider");
    return context;
}

export const REVENUE_PERIODS: Array<{ value: RevenuePeriod; label: string }> = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
    { value: "yearly", label: "This Year" },
];

export function formatReceptionCurrency(amount: number) {
    return `\u20A6${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
