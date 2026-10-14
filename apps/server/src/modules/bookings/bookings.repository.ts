import { database } from "#shared/database/prisma";
import type { Prisma } from "@prisma/client";

export const bookingsRepository = {
  async create(data: Prisma.BookingCreateInput) {
    return database.booking.create({ data });
  },

  async findById(id: string) {
    return database.booking.findUnique({
      where: { id },
      include: { room: true },
    });
  },

  async findActiveByRoomId(roomId: string) {
    return database.booking.findFirst({
      where: {
        roomId,
        status: { in: ["RESERVED", "CHECKED_IN", "CHECKOUT_DUE", "OVERDUE"] },
      },
    });
  },

  async checkIn(id: string) {
    return database.booking.update({
      where: { id },
      data: { status: "CHECKED_IN", checkInAt: new Date() },
    });
  },

  // One atomic transaction — same pattern as void-reversal: booking status
  // moves to CHECKED_OUT and every UNPAID sale charged to this booking
  // gets settled together, not as two separate writes.
  async checkout(id: string, settledByUserId: string) {
    return database.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status: "CHECKED_OUT", actualCheckoutAt: new Date() },
      });

      await tx.sale.updateMany({
        where: { chargeToRoomBookingId: id, paymentState: "UNPAID" },
        data: { paymentState: "PAID", settledAt: new Date(), settledByUserId },
      });

      return booking;
    });
  },

  async markCheckoutDue(now: Date) {
    return database.booking.updateMany({
      where: {
        status: "CHECKED_IN",
        expectedCheckoutAt: { lte: new Date(now.getTime() + 60 * 60 * 1000) },
      },
      data: { status: "CHECKOUT_DUE" },
    });
  },

  async markOverdue(now: Date) {
    return database.booking.updateMany({
      where: { status: "CHECKOUT_DUE", expectedCheckoutAt: { lt: now } },
      data: { status: "OVERDUE" },
    });
  },
};
