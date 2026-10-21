import { Queue } from "bullmq";
import { redisConnection } from "#shared/config/redis";

export const dailyReportQueue = new Queue("daily-report", {
  connection: redisConnection,
});

export async function scheduleDailyReportJob() {
  await dailyReportQueue.upsertJobScheduler(
    "daily-report-nightly",
    { pattern: "0 2 * * *" },
    { name: "generate" },
  );
}
