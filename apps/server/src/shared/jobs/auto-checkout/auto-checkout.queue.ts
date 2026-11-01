import { boss, startBoss } from "#shared/config/pgboss";

export const AUTO_CHECKOUT_QUEUE = "auto-checkout";

export async function scheduleAutoCheckoutJob() {
  await startBoss();
  await boss.createQueue(AUTO_CHECKOUT_QUEUE);
  await boss.schedule(AUTO_CHECKOUT_QUEUE, "*/5 * * * *", null, {
    singletonKey: "auto-checkout-sweep",
  });
}
