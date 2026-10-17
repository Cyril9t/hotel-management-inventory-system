import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "#shared/errors/http-errors";
import { bookingsRepository } from "./bookings.repository";
import { roomsRepository } from "../rooms/rooms.repository";
import type { CreateBookingBody, ListBookingsQuery } from "./bookings.schema";

export const bookingsService = {
  async create(data: CreateBookingBody, createdByUserId: string) {
    const existing = await bookingsRepository.findActiveByRoomId(data.roomId);
    if (existing)
      throw new BadRequestError("Room already has an active booking");

    const room = await roomsRepository.findById(data.roomId);
    if (!room) throw new NotFoundError("Room not found");

    const pricePerNightAtBooking = room.category.pricePerNight;
    const totalPrice = pricePerNightAtBooking.mul(data.nights);

    return bookingsRepository.create({
      room: { connect: { id: data.roomId } },
      guestFirstName: data.guestFirstName,
      guestLastName: data.guestLastName,
      guestPhone: data.guestPhone,
      guestGender: data.guestGender,
      nights: data.nights,
      expectedCheckoutAt: data.expectedCheckoutAt,
      pricePerNightAtBooking,
      totalPrice,
      paymentMethod: data.paymentMethod,
      status: data.checkInNow ? "CHECKED_IN" : "RESERVED",
      checkInAt: data.checkInNow ? new Date() : null,
      createdBy: { connect: { id: createdByUserId } },
    });
  },

  async getById(id: string) {
    const booking = await bookingsRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found");
    return booking;
  },

  async listBookings(filters: ListBookingsQuery = {}) {
    return bookingsRepository.list(filters);
  },

  async checkIn(id: string) {
    const booking = await bookingsService.getById(id);
    if (booking.status !== "RESERVED") {
      throw new BadRequestError("Only reserved bookings can be checked in");
    }
    return bookingsRepository.checkIn(id);
  },

  async checkout(id: string, settledByUserId: string) {
    const booking = await bookingsService.getById(id);
    if (!["CHECKED_IN", "CHECKOUT_DUE", "OVERDUE"].includes(booking.status)) {
      throw new BadRequestError("Booking is not in a checkout-eligible state");
    }
    const result = await bookingsRepository.checkout(id, settledByUserId);
    // TODO: audit log — "manual booking checkout" is a critical event
    return result;
  },

  async transitionCheckoutStatuses() {
    const now = new Date();
    const due = await bookingsRepository.markCheckoutDue(now);
    const overdue = await bookingsRepository.markOverdue(now);
    return { due: due.count, overdue: overdue.count };
  },
};
