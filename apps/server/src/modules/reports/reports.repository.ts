import { database } from "#shared/database/prisma";
import type { Department, Prisma } from "@prisma/client";

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

  // STUB — same query the nightly job snapshots, scoped to one calendar
  // day + department. Needs the real shift model's relations before this
  // is anything more than a shape placeholder.
  async computeLiveReport(reportDate: Date, department: Department) {
    const dayStart = new Date(reportDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const shifts = await database.shift.findMany({
      where: { department, openedAt: { gte: dayStart, lt: dayEnd } },
      // TODO: include sales / stockMovements / bookings once the real
      // relation names on `shift` are confirmed, and decide the actual
      // aggregation shape (totals? per-category breakdowns?) per report.
    });

    return shifts;
  },
};
