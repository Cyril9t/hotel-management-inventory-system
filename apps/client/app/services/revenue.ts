import type { RecordedBookingPayment } from "./payments";

export type RevenuePeriod = "daily" | "weekly" | "monthly" | "yearly";
export type RevenueBucket = { label: string; amount: number };

function startOfPeriod(now: Date, period: RevenuePeriod) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === "weekly") {
        const mondayOffset = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - mondayOffset);
    } else if (period === "monthly") start.setDate(1);
    else if (period === "yearly") start.setMonth(0, 1);
    return start;
}

function getBucketDates(start: Date, period: RevenuePeriod): Date[] {
    if (period === "daily") return Array.from({ length: 24 }, (_, hour) => new Date(start.getFullYear(), start.getMonth(), start.getDate(), hour));
    if (period === "weekly") return Array.from({ length: 7 }, (_, day) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + day));
    if (period === "monthly") return Array.from({ length: new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() }, (_, day) => new Date(start.getFullYear(), start.getMonth(), day + 1));
    return Array.from({ length: 12 }, (_, month) => new Date(start.getFullYear(), month, 1));
}

function bucketIndex(date: Date, start: Date, period: RevenuePeriod) {
    if (period === "daily") return date.getHours();
    if (period === "weekly") return Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start.getTime()) / 86_400_000);
    if (period === "monthly") return date.getDate() - 1;
    return date.getMonth();
}

function formatBucket(date: Date, period: RevenuePeriod) {
    if (period === "daily") return date.toLocaleTimeString("en-NG", { hour: "numeric", hour12: true });
    if (period === "weekly") return date.toLocaleDateString("en-NG", { weekday: "short", day: "numeric" });
    if (period === "monthly") return String(date.getDate());
    return date.toLocaleDateString("en-NG", { month: "short" });
}

export function aggregateReceptionRevenue(payments: RecordedBookingPayment[], period: RevenuePeriod, now: Date) {
    const start = startOfPeriod(now, period);
    const end = period === "daily" ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
        : period === "weekly" ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
            : period === "monthly" ? new Date(start.getFullYear(), start.getMonth() + 1, 1)
                : new Date(start.getFullYear() + 1, 0, 1);
    const dates = getBucketDates(start, period);
    const totals = Array.from({ length: dates.length }, () => 0);

    for (const payment of payments) {
        const timestamp = Date.parse(payment.paidAt);
        const amount = Number(payment.amount);
        if (!Number.isFinite(timestamp) || !Number.isFinite(amount) || amount < 0) {
            throw new Error("A recorded payment has an invalid amount or payment timestamp.");
        }
        if (timestamp < start.getTime() || timestamp >= end.getTime()) continue;
        const index = bucketIndex(new Date(timestamp), start, period);
        if (index >= 0 && index < totals.length) totals[index] += Math.round(amount * 100);
    }

    return {
        total: totals.reduce((sum, amount) => sum + amount, 0) / 100,
        buckets: dates.map((date, index) => ({ label: formatBucket(date, period), amount: totals[index] / 100 })),
    };
}
