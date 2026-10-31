import { database } from "#shared/database/prisma";
import type { Department, Prisma } from "@prisma/client";

export const shiftsRepository = {
  async findOpenByUserId(userId: string) {
    return database.shift.findFirst({
      where: { userId, status: "OPEN" },
    });
  },

  async findLastClosedByUserId(userId: string) {
    return database.shift.findFirst({
      where: { userId, status: "CLOSED" },
      orderBy: { closedAt: "desc" },
    });
  },

  async findById(id: string) {
    return database.shift.findUnique({
      where: { id },
      include: { receptionSnapshot: true },
    });
  },

  async findMany(filters: {
    userId?: string;
    department?: Department;
    status?: "OPEN" | "CLOSED";
  }) {
    return database.shift.findMany({
      where: filters,
      orderBy: { openedAt: "desc" },
    });
  },

  async create(data: Prisma.ShiftCreateInput) {
    return database.shift.create({ data });
  },

  async close(
    id: string,
    data: { actualCash: number; expectedCash: number; variance: number },
  ) {
    return database.shift.update({
      where: { id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        actualCash: data.actualCash,
        expectedCash: data.expectedCash,
        variance: data.variance,
      },
    });
  },

  // async computeExpectedCash(shiftId: string) {
  //   const [bookingsCash, salesCash] = await Promise.all([
  //     database.booking.aggregate({
  //       where: { shiftId, paymentMethod: "CASH" },
  //       _sum: { totalPrice: true },
  //     }),
  //     database.sale.aggregate({
  //       where: { shiftId, paymentMethod: "CASH", status: "COMPLETED" },
  //       _sum: { totalAmount: true },
  //     }),
  //   ]);

  //   const bookingsTotal = Number(bookingsCash._sum.totalPrice ?? 0);
  //   const salesTotal = Number(salesCash._sum.totalAmount ?? 0);

  //   return bookingsTotal + salesTotal;
  // },

  // Sums CASH payments actually collected during this shift — the single
  // source of truth is now the `payments` table (every sale-at-creation and
  // every booking-payment write lands here), not booking.totalPrice/sale.totalAmount
  // directly. No stock component, since stock movements never involve cash.
  async computeExpectedCash(shiftId: string) {
    const result = await database.payment.aggregate({
      where: { shiftId, method: "CASH" },
      _sum: { amount: true },
    });

    return Number(result._sum.amount ?? 0);
  },

  async createSnapshot(
    shiftId: string,
    roomSnapshotOpen: Prisma.InputJsonValue,
  ) {
    return database.receptionShiftSnapshot.create({
      data: { shiftId, roomSnapshotOpen },
    });
  },

  async closeSnapshot(
    shiftId: string,
    roomSnapshotClose: Prisma.InputJsonValue,
  ) {
    return database.receptionShiftSnapshot.update({
      where: { shiftId },
      data: { roomSnapshotClose },
    });
  },
};
