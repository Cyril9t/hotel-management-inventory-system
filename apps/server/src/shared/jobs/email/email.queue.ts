import { boss, startBoss } from "#shared/config/pgboss";

export const INVITE_EMAIL_QUEUE = "email-invite";
export const PASSWORD_RESET_EMAIL_QUEUE = "email-password-reset";

const RETRY_OPTIONS = {
  retryLimit: 3,
  retryDelay: 5,
  retryBackoff: true,
};

export async function ensureEmailQueues() {
  await startBoss();
  await boss.createQueue(INVITE_EMAIL_QUEUE);
  await boss.createQueue(PASSWORD_RESET_EMAIL_QUEUE);
}

export async function enqueueInviteEmail(data: {
  to: string;
  firstName: string;
  lastName: string;
  role: string;
  rawToken: string;
  expiresAt: Date;
}) {
  await boss.send(INVITE_EMAIL_QUEUE, data, RETRY_OPTIONS);
}

export async function enqueuePasswordResetEmail(data: {
  to: string;
  rawToken: string;
  expiresAt: Date;
}) {
  await boss.send(PASSWORD_RESET_EMAIL_QUEUE, data, RETRY_OPTIONS);
}
