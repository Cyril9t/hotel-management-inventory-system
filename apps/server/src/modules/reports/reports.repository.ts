import { database } from "#shared/database/prisma";
import type { Department, Prisma } from "@prisma/client";

function dayBounds(reportDate: Date) {
  const dayStart = new Date(reportDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { dayStart, dayEnd };
}

export const reportsRepository = {
  async findSnapshot(reportDate: Date, department: Department) {
    return database.dailyReportSnapshot.findUnique({
      where: { reportDate_department: { reportDate, department } },
    });
  },

  async upsertSnapshot(
    reportDate: Date,
    department: Department,
    data: Prisma.InputJsonValue,
  ) {
    return database.dailyReportSnapshot.upsert({
      where: { reportDate_department: { reportDate, department } },
      create: { reportDate, department, data, generatedAt: new Date() },
      update: { data, generatedAt: new Date() },
    });
  },

  async computeLiveReport(reportDate: Date, department: Department) {
    const { dayStart, dayEnd } = dayBounds(reportDate);

    switch (department) {
      case "RECEPTION":
        return reportsRepository.computeReceptionReport(dayStart, dayEnd);
      case "BAR":
      case "RESTAURANT":
        return reportsRepository.computeSalesReport(
          dayStart,
          dayEnd,
          department,
        );
      case "KITCHEN":
        return reportsRepository.computeKitchenReport(dayStart, dayEnd);
      case "STORE":
        return reportsRepository.computeStoreReport(dayStart, dayEnd);
    }
  },

  async computeReceptionReport(dayStart: Date, dayEnd: Date) {
    const [created, checkedIn, checkedOut, revenueByMethod, shifts] =
      await Promise.all([
        database.booking.count({
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        database.booking.count({
          where: { checkInAt: { gte: dayStart, lt: dayEnd } },
        }),
        database.booking.count({
          where: { actualCheckoutAt: { gte: dayStart, lt: dayEnd } },
        }),
        database.booking.groupBy({
          by: ["paymentMethod"],
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
          _sum: { totalPrice: true },
        }),
        database.shift.findMany({
          where: {
            department: "RECEPTION",
            openedAt: { gte: dayStart, lt: dayEnd },
            status: "CLOSED",
          },
          select: {
            userId: true,
            actualCash: true,
            expectedCash: true,
            variance: true,
          },
        }),
      ]);

    return {
      bookingsCreated: created,
      bookingsCheckedIn: checkedIn,
      bookingsCheckedOut: checkedOut,
      revenueByPaymentMethod: revenueByMethod.map((r) => ({
        paymentMethod: r.paymentMethod,
        total: Number(r._sum.totalPrice ?? 0),
      })),
      shiftCashVariance: shifts.map((s) => ({
        userId: s.userId,
        actualCash: s.actualCash ? Number(s.actualCash) : null,
        expectedCash: s.expectedCash ? Number(s.expectedCash) : null,
        variance: s.variance ? Number(s.variance) : null,
      })),
    };
  },

  async computeSalesReport(
    dayStart: Date,
    dayEnd: Date,
    department: "BAR" | "RESTAURANT",
  ) {
    const [completedAgg, voidedCount, topProducts, stockConsumed] =
      await Promise.all([
        database.sale.aggregate({
          where: {
            sourceDepartment: department,
            status: "COMPLETED",
            createdAt: { gte: dayStart, lt: dayEnd },
          },
          _count: true,
          _sum: { totalAmount: true },
        }),
        database.sale.count({
          where: {
            sourceDepartment: department,
            status: "VOIDED",
            voidedAt: { gte: dayStart, lt: dayEnd },
          },
        }),
        database.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: {
              sourceDepartment: department,
              createdAt: { gte: dayStart, lt: dayEnd },
            },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
        database.stockMovement.aggregate({
          where: {
            movementType: "SALE_DEDUCTION",
            fromDepartment: department,
            createdAt: { gte: dayStart, lt: dayEnd },
          },
          _sum: { quantity: true },
        }),
      ]);

    return {
      salesCount: completedAgg._count,
      revenue: Number(completedAgg._sum.totalAmount ?? 0),
      voidedSalesCount: voidedCount,
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        quantitySold: p._sum.quantity ?? 0,
      })),
      totalUnitsConsumed: stockConsumed._sum.quantity ?? 0,
    };
  },

  async computeKitchenReport(dayStart: Date, dayEnd: Date) {
    const [byStatus, discrepancies] = await Promise.all([
      database.kitchenOrder.groupBy({
        by: ["status"],
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
        _count: true,
      }),
      database.stockMovement.findMany({
        where: {
          toDepartment: "KITCHEN",
          acknowledgedAt: { gte: dayStart, lt: dayEnd },
          NOT: { acknowledgedQuantity: null },
        },
        select: {
          id: true,
          productId: true,
          quantity: true,
          acknowledgedQuantity: true,
        },
      }),
    ]);

    return {
      ordersByStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      issueDiscrepancies: discrepancies
        .filter((d) => d.acknowledgedQuantity !== d.quantity)
        .map((d) => ({
          movementId: d.id,
          productId: d.productId,
          expectedQuantity: d.quantity,
          acknowledgedQuantity: d.acknowledgedQuantity,
        })),
    };
  },

  async computeStoreReport(dayStart: Date, dayEnd: Date) {
    const [byType, lowStock] = await Promise.all([
      database.stockMovement.groupBy({
        by: ["movementType"],
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
        _count: true,
        _sum: { quantity: true },
      }),
      database.$queryRaw<
        {
          productId: string;
          name: string;
          quantity: number;
          lowStockThreshold: number;
        }[]
      >`
        SELECT sb.product_id as "productId", p.name, sb.quantity, p.low_stock_threshold as "lowStockThreshold"
        FROM stock_balances sb
        JOIN products p ON p.id = sb.product_id
        WHERE sb.department = 'STORE' AND sb.quantity <= p.low_stock_threshold
      `,
    ]);

    return {
      movementsByType: byType.map((m) => ({
        movementType: m.movementType,
        count: m._count,
        totalQuantity: m._sum.quantity ?? 0,
      })),
      lowStockProducts: lowStock,
    };
  },
};
