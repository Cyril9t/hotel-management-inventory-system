import { database } from "#shared/database/prisma";
import { BadRequestError, NotFoundError } from "#shared/errors/http-errors";
import { paymentsRepository } from "./payments.repository";
import { bookingsRepository } from "#modules/bookings/bookings.repository";
import { shiftsRepository } from "#modules/shifts/shifts.repository";
import { eventBus } from "#shared/events/bus";
import type { Prisma } from "@prisma/client";

export const paymentsService = {
  async recordForSale(
    tx: Prisma.TransactionClient,
    params: {
      saleId: string;
      amount: number;
      method: "CASH" | "TRANSFER" | "CARD";
      shiftId: string;
      receivedByUserId: string;
    },
  ) {
    return paymentsRepository.create(tx, {
      amount: params.amount,
      method: params.method,
      sale: { connect: { id: params.saleId } },
      shift: { connect: { id: params.shiftId } },
      receivedBy: { connect: { id: params.receivedByUserId } },
    });
  },

  async getBookingBalance(bookingId: string) {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError("Booking not found");

    const totalPaid = await paymentsRepository.sumByBookingId(bookingId);
    const totalPrice = Number(booking.totalPrice);
    const balance = totalPrice - totalPaid;

    return { totalPrice, totalPaid, balance, isFullyPaid: balance <= 0 };
  },

  async recordForBooking(
    bookingId: string,
    data: { amount: number; method: "CASH" | "TRANSFER" | "CARD" },
    actorUserId: string,
  ) {
    const shift = await shiftsRepository.findOpenByUserId(actorUserId);
    if (!shift) {
      throw new BadRequestError("Open a shift before recording a payment");
    }

    const { balance } = await paymentsService.getBookingBalance(bookingId);
    if (balance <= 0) {
      throw new BadRequestError("Booking is already fully paid");
    }
    if (data.amount > balance) {
      throw new BadRequestError(
        `Payment of ${data.amount} exceeds the remaining balance of ${balance}`,
      );
    }

    const payment = await paymentsRepository.create(database, {
      amount: data.amount,
      method: data.method,
      booking: { connect: { id: bookingId } },
      shift: { connect: { id: shift.id } },
      receivedBy: { connect: { id: actorUserId } },
    });

    eventBus.emit("payment.recorded", {
      paymentId: payment.id,
      bookingId,
      actorUserId,
      amount: data.amount,
      method: data.method,
      shiftId: shift.id,
    });

    return payment;
  },

  async listForBooking(bookingId: string) {
    return paymentsRepository.listByBookingId(bookingId);
  },
};
