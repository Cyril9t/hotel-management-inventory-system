import { boss, startBoss } from "#shared/config/pgboss";

export const DAILY_REPORT_QUEUE = "daily-report";

export async function scheduleDailyReportJob() {
  await startBoss();
  await boss.createQueue(DAILY_REPORT_QUEUE);
  await boss.schedule(DAILY_REPORT_QUEUE, "0 2 * * *", null, {
    singletonKey: "daily-report-nightly",
  });
}
