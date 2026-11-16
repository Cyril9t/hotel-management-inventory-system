import type { RecordedBookingPayment } from "./payments";
import type { AxiosInstance } from "axios";

export type RevenuePeriod = "daily" | "weekly" | "monthly" | "yearly";
export type RevenueBucket = { label: string; amount: number };
export type DepartmentRevenueBucket = RevenueBucket & { receptionAmount: number; barAmount: number; restaurantAmount: number };
export type DepartmentRevenueSale = { id: string; sourceDepartment: "BAR" | "RESTAURANT"; totalAmount: string; status: "COMPLETED" | "VOID_REQUESTED" | "VOIDED"; createdAt: string };

type ApiSuccess<T> = { success: true; data: T };

export async function getDepartmentRevenueSales(api: AxiosInstance): Promise<DepartmentRevenueSale[]> {
    const response = await api.get<ApiSuccess<{ sales: DepartmentRevenueSale[] }>>("/orders/sales");
    const sales = response.data?.data?.sales;
    if (!Array.isArray(sales)) throw new Error("The sales response did not contain a valid department sales list.");
    return sales.filter((sale) => sale.sourceDepartment === "BAR" || sale.sourceDepartment === "RESTAURANT");
}

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

export function aggregateDepartmentRevenue(
    payments: RecordedBookingPayment[],
    sales: DepartmentRevenueSale[],
    period: RevenuePeriod,
    now: Date,
) {
    const reception = aggregateReceptionRevenue(payments, period, now);
    const start = startOfPeriod(now, period);
    const end = period === "daily" ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
        : period === "weekly" ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
            : period === "monthly" ? new Date(start.getFullYear(), start.getMonth() + 1, 1)
                : new Date(start.getFullYear() + 1, 0, 1);
    const base = reception.buckets.map((bucket) => ({ ...bucket, receptionAmount: bucket.amount, barAmount: 0, restaurantAmount: 0 }));
    const totalsInCents = base.map((bucket) => ({
        reception: Math.round(bucket.receptionAmount * 100), bar: 0, restaurant: 0,
    }));
    for (const sale of sales) {
        if (sale.status !== "COMPLETED") continue;
        const timestamp = Date.parse(sale.createdAt);
        const amount = Number(sale.totalAmount);
        if (!Number.isFinite(timestamp) || !Number.isFinite(amount) || amount < 0) {
            throw new Error("A department sale has an invalid amount or timestamp.");
        }
        if (timestamp < start.getTime() || timestamp >= end.getTime()) continue;
        const date = new Date(timestamp);
        const index = bucketIndex(date, start, period);
        if (index < 0 || index >= base.length) continue;
        const department = sale.sourceDepartment === "BAR" ? "bar" : "restaurant";
        totalsInCents[index][department] += Math.round(amount * 100);
    }
    const buckets: DepartmentRevenueBucket[] = base.map((bucket, index) => ({
        label: bucket.label,
        receptionAmount: totalsInCents[index].reception / 100,
        barAmount: totalsInCents[index].bar / 100,
        restaurantAmount: totalsInCents[index].restaurant / 100,
        amount: (totalsInCents[index].reception + totalsInCents[index].bar + totalsInCents[index].restaurant) / 100,
    }));
    return { total: buckets.reduce((sum, bucket) => sum + bucket.amount, 0), buckets };
}
