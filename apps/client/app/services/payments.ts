import type { AxiosInstance } from "axios";

export type BookingPaymentMethod = "CASH" | "TRANSFER" | "CARD";

interface ApiSuccess<T> {
    success: true;
    data: T;
}

interface BookingListResponse {
    bookings: Array<{ id: string }>;
}

interface BookingPaymentsResponse {
    payments: RecordedBookingPayment[];
}

export interface BookingBalance {
    totalPrice: number;
    totalPaid: number;
    balance: number;
    isFullyPaid: boolean;
}

export interface RecordedBookingPayment {
    id: string;
    amount: string;
    method: BookingPaymentMethod | "CHARGE_TO_ROOM";
    bookingId: string | null;
    saleId: string | null;
    receivedByUserId: string;
    shiftId: string;
    paidAt: string;
}

function isRecordedBookingPayment(value: unknown): value is RecordedBookingPayment {
    if (!value || typeof value !== "object") return false;
    const payment = value as Record<string, unknown>;
    return typeof payment.id === "string" && typeof payment.amount === "string" &&
        ["CASH", "TRANSFER", "CARD", "CHARGE_TO_ROOM"].includes(String(payment.method)) &&
        (typeof payment.bookingId === "string" || payment.bookingId === null) &&
        (typeof payment.saleId === "string" || payment.saleId === null) &&
        typeof payment.receivedByUserId === "string" && typeof payment.shiftId === "string" &&
        typeof payment.paidAt === "string";
}

export async function recordBookingPayment(
    api: AxiosInstance,
    bookingId: string,
    amount: number,
    method: BookingPaymentMethod,
): Promise<RecordedBookingPayment> {
    const response = await api.post<ApiSuccess<{ payment: unknown }>>(
        `/bookings/${encodeURIComponent(bookingId)}/payments`,
        { amount, method },
    );
    const payment = response.data?.data?.payment;
    if (!isRecordedBookingPayment(payment)) throw new Error("The payment response did not contain the documented payment record.");
    return payment;
}

export async function getBookingBalance(api: AxiosInstance, bookingId: string): Promise<BookingBalance> {
    const response = await api.get<ApiSuccess<{ balance: BookingBalance }>>(
        `/bookings/${encodeURIComponent(bookingId)}/payments/balance`,
    );
    const balance = response.data?.data?.balance;
    if (!balance || ![balance.totalPrice, balance.totalPaid, balance.balance].every((amount) => Number.isFinite(amount) && amount >= 0) || typeof balance.isFullyPaid !== "boolean") {
        throw new Error("The booking balance response did not contain a valid payment balance.");
    }
    return balance;
}

export async function getBookingPayments(api: AxiosInstance, bookingId: string): Promise<RecordedBookingPayment[]> {
    const response = await api.get<ApiSuccess<BookingPaymentsResponse>>(
        `/bookings/${encodeURIComponent(bookingId)}/payments`,
    );
    const payments = response.data?.data?.payments;
    if (!Array.isArray(payments) || !payments.every(isRecordedBookingPayment)) {
        throw new Error("The booking payments response did not contain a valid payment list.");
    }
    return payments;
}

/**
 * Loads persisted Reception booking payment records. The API exposes payment
 * lists per booking rather than a global payment/revenue endpoint, so callers
 * should load this once and aggregate locally for period changes.
 */
export async function getReceptionBookingPayments(api: AxiosInstance): Promise<RecordedBookingPayment[]> {
    const response = await api.get<ApiSuccess<BookingListResponse>>("/bookings");
    const bookings = response.data?.data?.bookings;
    if (!Array.isArray(bookings) || !bookings.every((booking) => typeof booking?.id === "string" && booking.id.length > 0)) {
        throw new Error("The bookings response did not contain a valid booking list.");
    }

    const paymentLists: RecordedBookingPayment[][] = [];
    const batchSize = 6;
    for (let index = 0; index < bookings.length; index += batchSize) {
        const batch = bookings.slice(index, index + batchSize);
        const results = await Promise.all(batch.map(async ({ id }) => {
            const payments = await getBookingPayments(api, id);
            return payments.filter((payment) => payment.bookingId === id && payment.saleId === null);
        }));
        paymentLists.push(...results);
    }

    const seenIds = new Set<string>();
    return paymentLists.flat().filter((payment) => {
        if (seenIds.has(payment.id)) return false;
        seenIds.add(payment.id);
        return payment.method === "CASH" || payment.method === "TRANSFER" || payment.method === "CARD";
    });
}

/**
 * Aggregates CASH payments across bookings for a given shift.
 * Note: Prefer using `GET /shifts/current` which directly provides `expectedCash`
 * computed as `SUM(payments WHERE shiftId = shift.id AND method = 'CASH')` on the server
 * without incurring N+1 HTTP requests (`GET /bookings` + `GET /bookings/:id/payments`).
 */
export async function getShiftCashPayments(
    api: AxiosInstance,
    shiftId: string,
    openedAt: string,
    closedAt?: string | null,
): Promise<number> {
    const openedAtTime = Date.parse(openedAt);
    const closedAtTime = closedAt ? Date.parse(closedAt) : Date.now();
    if (!Number.isFinite(openedAtTime) || (closedAt && !Number.isFinite(closedAtTime))) {
        throw new Error("The shift does not contain valid timestamps for payment reconciliation.");
    }
    const bookingResponse = await api.get<ApiSuccess<BookingListResponse>>("/bookings");
    const bookings = bookingResponse.data?.data?.bookings;
    if (!Array.isArray(bookings) || !bookings.every((booking) => typeof booking?.id === "string")) {
        throw new Error("The bookings response did not contain a valid booking list.");
    }

    const bookingPayments = await Promise.all(bookings.map(async ({ id }) => ({
        bookingId: id,
        payments: await getBookingPayments(api, id),
    })));
    const seenPaymentIds = new Set<string>();

    return bookingPayments.flatMap(({ bookingId, payments }) => payments
        .filter((payment) => {
            if (payment.bookingId !== bookingId || payment.shiftId !== shiftId || payment.method !== "CASH" || seenPaymentIds.has(payment.id)) return false;
            const paidAt = Date.parse(payment.paidAt);
            if (!Number.isFinite(paidAt)) throw new Error("The payment API returned an invalid payment timestamp.");
            if (paidAt < openedAtTime || paidAt > closedAtTime) return false;
            seenPaymentIds.add(payment.id);
            return true;
        }))
        .reduce((total, payment) => {
        const amount = Number(payment.amount);
        if (!Number.isFinite(amount) || amount < 0) throw new Error("The payment API returned an invalid amount.");
        return total + amount;
    }, 0);
}
