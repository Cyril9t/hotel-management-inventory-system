import type { AxiosInstance } from "axios";

export type BookingStatus = "RESERVED" | "CHECKED_IN" | "CHECKOUT_DUE" | "OVERDUE" | "CHECKED_OUT";
export type BookingPaymentMethod = "CASH" | "TRANSFER" | "CARD" | "CHARGE_TO_ROOM";

export interface BookingRoomSummary {
    id?: string;
    number?: string;
    categoryId?: string;
    isActive?: boolean;
    category?: {
        id?: string;
        name?: string;
        pricePerNight?: string;
    };
}

export interface BookingRecord {
    id: string;
    roomId: string;
    guestFirstName: string;
    guestLastName: string;
    guestPhone: string;
    guestGender: string;
    nights: number;
    pricePerNightAtBooking: string;
    totalPrice: string;
    paymentMethod: BookingPaymentMethod;
    checkInAt: string | null;
    expectedCheckoutAt: string;
    actualCheckoutAt: string | null;
    status: BookingStatus;
    createdByUserId: string;
    createdBy?: { firstName?: string; lastName?: string };
    shiftId: string | null;
    createdAt: string;
    room?: BookingRoomSummary;
}

export async function getBookingHistory(api: AxiosInstance, filters?: { startDate?: string; endDate?: string }): Promise<BookingRecord[]> {
    const response = await api.get<ApiSuccess<{ bookings: unknown }>>("/bookings", { params: filters });
    const bookings = response.data?.data?.bookings;
    if (!Array.isArray(bookings) || !bookings.every(isBookingRecord)) {
        throw new Error("Booking history response did not contain a valid bookings list.");
    }
    return bookings as BookingRecord[];
}

/** Fields needed to associate and render a booking from the list endpoint. */
export interface BookingSummary {
    id: string;
    roomId: string;
    status?: string;
    guestFirstName?: string;
    guestLastName?: string;
    guestPhone?: string;
    guestGender?: string;
    checkInAt?: string | null;
    expectedCheckoutAt?: string;
    pricePerNightAtBooking?: string;
    totalPrice?: string;
    room?: {
        number?: string;
        category?: { name?: string };
    };
}

interface ApiSuccess<T> {
    success: true;
    data: T;
}

const bookingStatuses: readonly BookingStatus[] = ["RESERVED", "CHECKED_IN", "CHECKOUT_DUE", "OVERDUE", "CHECKED_OUT"];
const paymentMethods: readonly BookingPaymentMethod[] = ["CASH", "TRANSFER", "CARD", "CHARGE_TO_ROOM"];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBookingRoom(value: unknown): value is BookingRoomSummary {
    if (!isRecord(value)) return false;
    // The list endpoint currently includes the room's scalar fields, while the
    // detail endpoint may also include its category relation.
    if (value.id !== undefined && typeof value.id !== "string") return false;
    if (value.number !== undefined && typeof value.number !== "string") return false;
    if (value.categoryId !== undefined && typeof value.categoryId !== "string") return false;
    if (value.isActive !== undefined && typeof value.isActive !== "boolean") return false;
    if (value.category !== undefined && value.category !== null && !isRecord(value.category)) return false;
    return true;
}

function isBookingRecord(value: unknown): value is BookingRecord {
    if (!isRecord(value)) return false;
    const hasRoom = value.room === undefined || isBookingRoom(value.room);
    return hasRoom && typeof value.id === "string" && typeof value.roomId === "string" &&
        typeof value.guestFirstName === "string" && typeof value.guestLastName === "string" &&
        typeof value.guestPhone === "string" && typeof value.guestGender === "string" &&
        Number.isInteger(value.nights) && typeof value.pricePerNightAtBooking === "string" &&
        typeof value.totalPrice === "string" && paymentMethods.includes(value.paymentMethod as BookingPaymentMethod) &&
        (typeof value.checkInAt === "string" || value.checkInAt === null) &&
        typeof value.expectedCheckoutAt === "string" &&
        (typeof value.actualCheckoutAt === "string" || value.actualCheckoutAt === null) &&
        bookingStatuses.includes(value.status as BookingStatus) &&
        typeof value.createdByUserId === "string" &&
        (typeof value.shiftId === "string" || value.shiftId === null) && typeof value.createdAt === "string";
}

function toBookingSummary(value: unknown): BookingSummary | null {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.roomId !== "string") return null;

    const summary: BookingSummary = { id: value.id, roomId: value.roomId };
    if (typeof value.status === "string") summary.status = value.status;
    if (typeof value.guestFirstName === "string") summary.guestFirstName = value.guestFirstName;
    if (typeof value.guestLastName === "string") summary.guestLastName = value.guestLastName;
    if (typeof value.guestPhone === "string") summary.guestPhone = value.guestPhone;
    if (typeof value.guestGender === "string") summary.guestGender = value.guestGender;
    if (typeof value.checkInAt === "string" || value.checkInAt === null) summary.checkInAt = value.checkInAt;
    if (typeof value.expectedCheckoutAt === "string") summary.expectedCheckoutAt = value.expectedCheckoutAt;
    if (typeof value.pricePerNightAtBooking === "string") summary.pricePerNightAtBooking = value.pricePerNightAtBooking;
    if (typeof value.totalPrice === "string") summary.totalPrice = value.totalPrice;

    if (isRecord(value.room)) {
        const room: NonNullable<BookingSummary["room"]> = {};
        if (typeof value.room.number === "string") room.number = value.room.number;
        if (isRecord(value.room.category) && typeof value.room.category.name === "string") {
            room.category = { name: value.room.category.name };
        }
        summary.room = room;
    }

    return summary;
}

export async function getBookingsForRoom(api: AxiosInstance, roomId: string): Promise<BookingSummary[]> {
    const response = await api.get<ApiSuccess<{ bookings: unknown }>>("/bookings", { params: { roomId } });
    const bookings = response.data?.data?.bookings;
    if (!Array.isArray(bookings)) {
        throw new Error("Expected the documented data.bookings array in the booking list response.");
    }
    const summaries = bookings.map(toBookingSummary);
    if (summaries.some((booking) => booking === null)) {
        throw new Error("The bookings response contained a record without a valid booking ID or room ID.");
    }
    return summaries as BookingSummary[];
}

export async function getBookingDetails(api: AxiosInstance, bookingId: string): Promise<BookingRecord> {
    const response = await api.get<ApiSuccess<{ booking: unknown }>>(`/bookings/${encodeURIComponent(bookingId)}`);
    const booking = response.data?.data?.booking;
    if (!isBookingRecord(booking)) {
        throw new Error("The booking details response did not contain a valid booking record.");
    }
    return booking;
}

export async function checkoutBooking(api: AxiosInstance, bookingId: string): Promise<BookingRecord> {
    const response = await api.post<ApiSuccess<{ booking: unknown }>>(
        `/bookings/${encodeURIComponent(bookingId)}/checkout`,
    );
    const booking = response.data?.data?.booking;
    if (!isBookingRecord(booking)) {
        throw new Error("The checkout response did not contain a valid booking record.");
    }
    return booking;
}
