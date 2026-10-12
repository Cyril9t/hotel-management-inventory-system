import { reportsService } from "#modules/reports/reports.service";
import { logger } from "#shared/logger";

export async function processDailyReport() {
  await reportsService.generateAllSnapshots(yesterday());
  logger.info("daily report snapshots generated");
}

export async function catchUpDailyReport() {
  await reportsService.backfillMissingSnapshots(yesterday());
}

function yesterday(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
