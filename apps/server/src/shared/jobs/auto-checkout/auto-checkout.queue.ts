import { Queue } from "bullmq";
import { redisConnection } from "#shared/config/redis";
import { logger } from "#shared/logger";

export const autoCheckoutQueue = new Queue("auto-checkout", {
  connection: redisConnection,
});

export async function scheduleAutoCheckoutJob() {
  await autoCheckoutQueue.upsertJobScheduler(
    "auto-checkout-sweep",
    { every: 5 * 60 * 1000 },
    { name: "sweep" },
  );
}

autoCheckoutQueue.on("error", (err) =>
  logger.error({ queue: autoCheckoutQueue.name, err }, "queue error"),
);
