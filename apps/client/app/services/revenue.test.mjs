import test from "node:test";
import assert from "node:assert/strict";
import { aggregateReceptionRevenue } from "./revenue.ts";
import { getReceptionBookingPayments } from "./payments.ts";

process.env.TZ = "Africa/Lagos";

function payment(id, amount, method, paidAt, bookingId = "booking-1", saleId = null) {
    return { id, amount: String(amount), method, bookingId, saleId, receivedByUserId: "staff-1", shiftId: "shift-1", paidAt };
}

function createPaymentApi(bookings, paymentLists) {
    return {
        async get(path) {
            if (path === "/bookings") return { data: { success: true, data: { bookings: bookings.map((id) => ({ id })) } } };
            const bookingId = path.split("/")[2];
            return { data: { success: true, data: { payments: paymentLists[bookingId] ?? [] } } };
        },
    };
}

test("includes distinct cash, transfer, card and split payment records; drops unsupported and duplicate records", async () => {
    const duplicate = payment("cash-1", 120, "CASH", "2026-06-10T10:10:00+01:00");
    const records = await getReceptionBookingPayments(createPaymentApi(["booking-1"], {
        "booking-1": [
            duplicate,
            { ...duplicate },
            payment("transfer-1", 80, "TRANSFER", "2026-06-10T10:15:00+01:00"),
            payment("card-1", 50, "CARD", "2026-06-10T10:20:00+01:00"),
            payment("room-charge", 500, "CHARGE_TO_ROOM", "2026-06-10T10:25:00+01:00"),
        ],
    }));
    assert.deepEqual(records.map(({ id }) => id), ["cash-1", "transfer-1", "card-1"]);
    assert.equal(aggregateReceptionRevenue(records, "daily", new Date("2026-06-10T12:00:00+01:00")).total, 250);
});

test("an unpaid booking with no recorded payment is not revenue", async () => {
    const records = await getReceptionBookingPayments(createPaymentApi(["unpaid-booking"], {}));
    assert.equal(records.length, 0);
    assert.equal(aggregateReceptionRevenue(records, "daily", new Date("2026-06-10T12:00:00+01:00")).total, 0);
});

test("daily aggregation uses paidAt hour and excludes payments from adjacent dates", () => {
    const result = aggregateReceptionRevenue([
        payment("today-morning", 25, "CASH", "2026-06-10T09:15:00+01:00"),
        payment("today-evening", 75, "CARD", "2026-06-10T20:05:00+01:00"),
        payment("yesterday", 1000, "TRANSFER", "2026-06-09T22:00:00+01:00"),
    ], "daily", new Date("2026-06-10T12:00:00+01:00"));
    assert.equal(result.total, 100);
    assert.equal(result.buckets.length, 24);
    assert.equal(result.buckets[9].amount, 25);
    assert.equal(result.buckets[20].amount, 75);
});

test("weekly grouping is Monday through Sunday and includes empty days", () => {
    const result = aggregateReceptionRevenue([
        payment("monday", 10, "CASH", "2026-06-08T08:00:00+01:00"),
        payment("sunday", 30, "CARD", "2026-06-14T08:00:00+01:00"),
        payment("prior-sunday", 900, "TRANSFER", "2026-06-07T23:00:00+01:00"),
    ], "weekly", new Date("2026-06-10T12:00:00+01:00"));
    assert.equal(result.total, 40);
    assert.equal(result.buckets.length, 7);
    assert.equal(result.buckets[0].amount, 10);
    assert.equal(result.buckets[1].amount, 0);
    assert.equal(result.buckets[6].amount, 30);
});

test("monthly and yearly grouping use payment dates and zero-fill periods", () => {
    const transactions = [
        payment("first", 40, "CASH", "2026-06-01T01:00:00+01:00"),
        payment("last", 60, "CARD", "2026-06-30T23:00:00+01:00"),
        payment("previous-month", 800, "TRANSFER", "2026-05-31T23:59:00+01:00"),
    ];
    const monthly = aggregateReceptionRevenue(transactions, "monthly", new Date("2026-06-10T12:00:00+01:00"));
    const yearly = aggregateReceptionRevenue(transactions, "yearly", new Date("2026-06-10T12:00:00+01:00"));
    assert.equal(monthly.total, 100);
    assert.equal(monthly.buckets.length, 30);
    assert.equal(monthly.buckets[0].amount, 40);
    assert.equal(monthly.buckets[1].amount, 0);
    assert.equal(monthly.buckets[29].amount, 60);
    assert.equal(yearly.total, 900);
    assert.equal(yearly.buckets.length, 12);
    assert.equal(yearly.buckets[5].amount, 100);
    assert.equal(yearly.buckets[4].amount, 800);
});

test("invalid amounts and timestamps fail the report instead of producing misleading totals", () => {
    assert.throws(() => aggregateReceptionRevenue([payment("bad-amount", "not-money", "CASH", "2026-06-10T10:00:00+01:00")], "daily", new Date("2026-06-10T12:00:00+01:00")));
    assert.throws(() => aggregateReceptionRevenue([payment("bad-time", 20, "CASH", "not-a-time")], "daily", new Date("2026-06-10T12:00:00+01:00")));
});
