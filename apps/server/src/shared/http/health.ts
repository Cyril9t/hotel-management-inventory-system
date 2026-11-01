import type { Request, Response } from "express";
import { database } from "../database/prisma";
import { boss } from "../config/pgboss";
import { AUTO_CHECKOUT_QUEUE } from "../jobs/auto-checkout/auto-checkout.queue";
import { checkWorkerHealth } from "./worker-client";
import { failure, success } from "../utils/api-response";

export async function healthCheck(_req: Request, res: Response) {
  const [db, pgboss, worker] = await Promise.allSettled([
    database.$queryRaw`SELECT 1`,
    boss.getQueue(AUTO_CHECKOUT_QUEUE),
    checkWorkerHealth(),
  ]);

  const checks = {
    db: db.status === "fulfilled",
    pgboss: pgboss.status === "fulfilled" && pgboss.value != null,
    worker: worker.status === "fulfilled" && worker.value,
  };

  const ok = Object.values(checks).every(Boolean);
  res.status(ok ? 200 : 503).json(
    ok
      ? success({
          status: "ok",
          checks,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        })
      : failure({
          code: "SERVICE_UNAVAILABLE",
          message: "one or more dependencies unhealthy",
          details: { status: "degraded", checks },
        }),
  );
}
