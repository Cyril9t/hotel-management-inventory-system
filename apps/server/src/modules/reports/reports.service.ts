import { reportsRepository } from "./reports.repository";
import type { Department, Prisma } from "@prisma/client";

const DEPARTMENTS: Department[] = [
  "BAR",
  "RESTAURANT",
  "KITCHEN",
  "RECEPTION",
  "STORE",
];

export const reportsService = {
  async getReport(reportDate: Date, department: Department) {
    const snapshot = await reportsRepository.findSnapshot(
      reportDate,
      department,
    );
    if (snapshot) return snapshot.data;
    return reportsRepository.computeLiveReport(reportDate, department);
  },

  async generateSnapshot(reportDate: Date, department: Department) {
    const data = await reportsRepository.computeLiveReport(
      reportDate,
      department,
    );
    return reportsRepository.upsertSnapshot(
      reportDate,
      department,
      data as Prisma.InputJsonValue,
    );
  },

  async generateAllSnapshots(reportDate: Date) {
    for (const department of DEPARTMENTS) {
      await reportsService.generateSnapshot(reportDate, department);
    }
  },

  async backfillMissingSnapshots(reportDate: Date) {
    for (const department of DEPARTMENTS) {
      const existing = await reportsRepository.findSnapshot(
        reportDate,
        department,
      );
      if (!existing)
        await reportsService.generateSnapshot(reportDate, department);
    }
  },
};
