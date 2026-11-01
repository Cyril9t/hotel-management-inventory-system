import { PgBoss } from "pg-boss";
import { env } from "./env";
import { logger } from "../logger";

export const boss = new PgBoss({
  connectionString: env.PGBOSS_DATABASE_URL,
  schema: env.PGBOSS_SCHEMA,
});

// Required: an EventEmitter with no 'error' listener throws and crashes
// the process on error — same reason the old redis.ts attached one.
boss.on("error", (err) => {
  logger.error(
    { error: { message: err.message, stack: err.stack } },
    "pg-boss error",
  );
});

boss.on("stopped", () => logger.warn("pg-boss stopped"));

let started = false;

export async function startBoss() {
  if (started) return;
  await boss.start();
  started = true;
  logger.info("pg-boss started");
}
