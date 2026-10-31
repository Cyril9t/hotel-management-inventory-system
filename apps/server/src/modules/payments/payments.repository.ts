import { database } from "#shared/database/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient | PrismaClient;

export const paymentsRepository = {
  async create(tx: Tx, data: Prisma.PaymentCreateInput) {
    return tx.payment.create({ data });
  },

  async sumByBookingId(bookingId: string) {
    const result = await database.payment.aggregate({
      where: { bookingId },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  },

  async listByBookingId(bookingId: string) {
    return database.payment.findMany({
      where: { bookingId },
      orderBy: { paidAt: "asc" },
    });
  },
};
