import { Queue } from "bullmq";
import { redisConnection } from "#shared/config/redis";

export const emailQueue = new Queue("email", {
  connection: redisConnection,
});

const RETRY_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5000 },
};

export async function enqueueInviteEmail(data: {
  to: string;
  firstName: string;
  rawToken: string;
}) {
  await emailQueue.add("invite", data, RETRY_OPTIONS);
}

export async function enqueuePasswordResetEmail(data: {
  to: string;
  rawToken: string;
}) {
  await emailQueue.add("password-reset", data, RETRY_OPTIONS);
}
