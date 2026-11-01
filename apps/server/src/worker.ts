import { boss, startBoss } from "#shared/config/pgboss";
import { logger } from "#shared/logger";
import { AUTO_CHECKOUT_QUEUE } from "#shared/jobs/auto-checkout/auto-checkout.queue";
import { processAutoCheckout } from "#shared/jobs/auto-checkout/auto-checkout.worker";
import { DAILY_REPORT_QUEUE } from "#shared/jobs/daily-report/daily-report.queue";
import {
  processDailyReport,
  catchUpDailyReport,
} from "#shared/jobs/daily-report/daily-report.worker";
import {
  INVITE_EMAIL_QUEUE,
  PASSWORD_RESET_EMAIL_QUEUE,
} from "#shared/jobs/email/email.queue";
import {
  processInviteEmailJob,
  processPasswordResetEmailJob,
} from "#shared/jobs/email/email.worker";
import { startWorkerHealthServer } from "./shared/http/worker-health-server";
import { env } from "./shared/config/env";

function withLogging<T extends { id: string }>(
  queue: string,
  handler: (jobs: T[]) => Promise<unknown>,
) {
  return async (jobs: T[]) => {
    try {
      await handler(jobs);
      logger.info({ queue, jobIds: jobs.map((j) => j.id) }, "job completed");
    } catch (err) {
      logger.error(
        { queue, jobIds: jobs.map((j) => j.id), error: err },
        "job failed",
      );
      throw err;
    }
  };
}

const QUEUES = [
  AUTO_CHECKOUT_QUEUE,
  DAILY_REPORT_QUEUE,
  INVITE_EMAIL_QUEUE,
  PASSWORD_RESET_EMAIL_QUEUE,
];

async function main() {
  await startBoss();

  boss.on("error", (err) => logger.error({ error: err }, "pg-boss error"));

  // idempotent — makes worker.ts independent of index.ts's boot order
  for (const queue of QUEUES) {
    await boss.createQueue(queue);
  }

  await boss.work(
    AUTO_CHECKOUT_QUEUE,
    withLogging(AUTO_CHECKOUT_QUEUE, () => processAutoCheckout()),
  );
  await boss.work(
    DAILY_REPORT_QUEUE,
    withLogging(DAILY_REPORT_QUEUE, () => processDailyReport()),
  );
  await boss.work(
    INVITE_EMAIL_QUEUE,
    { batchSize: 5 },
    withLogging(INVITE_EMAIL_QUEUE, processInviteEmailJob),
  );
  await boss.work(
    PASSWORD_RESET_EMAIL_QUEUE,
    { batchSize: 5 },
    withLogging(PASSWORD_RESET_EMAIL_QUEUE, processPasswordResetEmailJob),
  );

  catchUpDailyReport().catch((err) =>
    logger.error({ error: err }, "daily report catch-up failed"),
  );

  startWorkerHealthServer(env.WORKER_HEALTH_PORT);
}

main().catch((err) => {
  logger.error({ error: err }, "worker failed to start");
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await boss.stop({ graceful: true });
  process.exit(0);
});
