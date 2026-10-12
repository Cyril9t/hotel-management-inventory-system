import { Worker } from "bullmq";
import { redisConnection } from "#shared/config/redis";
import { logger } from "#shared/logger";
import { autoCheckoutQueue } from "#shared/jobs/auto-checkout/auto-checkout.queue";
import { processAutoCheckout } from "#shared/jobs/auto-checkout/auto-checkout.worker";
import { dailyReportQueue } from "#shared/jobs/daily-report/daily-report.queue";
import {
  processDailyReport,
  catchUpDailyReport,
} from "#shared/jobs/daily-report/daily-report.worker";
import { emailQueue } from "#shared/jobs/email/email.queue";
import { processEmailJob } from "#shared/jobs/email/email.worker";

const autoCheckoutWorker = new Worker(
  autoCheckoutQueue.name,
  async () => processAutoCheckout(),
  { connection: redisConnection },
);

const dailyReportWorker = new Worker(
  dailyReportQueue.name,
  async () => processDailyReport(),
  { connection: redisConnection },
);

const emailWorker = new Worker(emailQueue.name, processEmailJob, {
  connection: redisConnection,
});

for (const worker of [autoCheckoutWorker, dailyReportWorker, emailWorker]) {
  worker.on("completed", (job) =>
    logger.info({ jobId: job.id, queue: job.queueName }, "job completed"),
  );
  worker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, queue: job?.queueName, err }, "job failed"),
  );
  worker.on("error", (err) =>
    logger.error({ queue: worker.name, err }, "worker error"),
  );
}

catchUpDailyReport().catch((err) =>
  logger.error({ err }, "daily report catch-up failed"),
);

process.on("SIGTERM", async () => {
  await Promise.all([
    autoCheckoutWorker.close(),
    dailyReportWorker.close(),
    emailWorker.close(),
  ]);
  process.exit(0);
});
