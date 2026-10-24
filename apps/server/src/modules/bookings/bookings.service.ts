import { BadRequestError, NotFoundError } from "#shared/errors/http-errors";
import { bookingsRepository } from "./bookings.repository";
import { roomsRepository } from "../rooms/rooms.repository";
import { shiftsRepository } from "../shifts/shifts.repository";
import { eventBus } from "#shared/events/bus";
import type { CreateBookingBody, ListBookingsQuery } from "./bookings.schema";

export const bookingsService = {
  async create(data: CreateBookingBody, createdByUserId: string) {
    const shift = await shiftsRepository.findOpenByUserId(createdByUserId);
    if (!shift) {
      throw new BadRequestError("Open a shift before creating a booking");
    }

    const existing = await bookingsRepository.findActiveByRoomId(data.roomId);
    if (existing)
      throw new BadRequestError("Room already has an active booking");

    const room = await roomsRepository.findById(data.roomId);
    if (!room) throw new NotFoundError("Room not found");

    const pricePerNightAtBooking = room.category.pricePerNight;
    const totalPrice = pricePerNightAtBooking.mul(data.nights);

    const booking = await bookingsRepository.create({
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
      shift: { connect: { id: shift.id } },
    });

    eventBus.emit("booking.created", {
      bookingId: booking.id,
      actorUserId: createdByUserId,
      roomId: data.roomId,
      totalPrice: booking.totalPrice,
      paymentMethod: data.paymentMethod,
    });

    return booking;
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

    const unpaidSales =
      await bookingsRepository.findUnpaidChargeToRoomSales(id);
    if (unpaidSales.length > 0) {
      throw new BadRequestError(
        `Booking has ${unpaidSales.length} unpaid charge-to-room sale(s) — settle them before checkout`,
      );
    }

    const result = await bookingsRepository.checkout(id);

    eventBus.emit("booking.manualCheckout", {
      bookingId: id,
      actorUserId: settledByUserId,
      beforeStatus: booking.status,
      actualCheckoutAt: result.actualCheckoutAt,
    });

    return result;
  },

  async transitionCheckoutStatuses() {
    const now = new Date();
    const due = await bookingsRepository.markCheckoutDue(now);
    const overdue = await bookingsRepository.markOverdue(now);
    return { due: due.count, overdue: overdue.count };
  },
};
