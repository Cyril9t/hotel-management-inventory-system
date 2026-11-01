import type { Job } from "pg-boss";
import { email } from "#shared/lib/email";

export async function processInviteEmailJob(jobs: Job<any>[]) {
  for (const job of jobs) await email.sendInvite(job.data);
}

export async function processPasswordResetEmailJob(jobs: Job<any>[]) {
  for (const job of jobs) await email.sendPasswordReset(job.data);
}
