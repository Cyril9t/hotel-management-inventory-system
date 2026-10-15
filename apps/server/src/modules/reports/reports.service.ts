import { reportsRepository } from "./reports.repository";
import type { Department } from "@prisma/client";

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
    // No snapshot yet (today, or a day the nightly job hasn't run for) —
    // the snapshot is a cache, never the source of truth.
    return reportsRepository.computeLiveReport(reportDate, department);
  },

  async generateSnapshot(reportDate: Date, department: Department) {
    const data = await reportsRepository.computeLiveReport(
      reportDate,
      department,
    );
    return reportsRepository.upsertSnapshot(reportDate, department, data);
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
