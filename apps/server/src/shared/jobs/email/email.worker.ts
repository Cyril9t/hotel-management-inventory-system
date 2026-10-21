import type { Job } from "bullmq";
import { email } from "#shared/lib/email";
import { logger } from "#shared/logger";

export async function processEmailJob(job: Job) {
  switch (job.name) {
    case "invite":
      return email.sendInvite(job.data);
    case "password-reset":
      return email.sendPasswordReset(job.data);
    default:
      logger.warn({ jobName: job.name }, "unknown email job type");
  }
}
