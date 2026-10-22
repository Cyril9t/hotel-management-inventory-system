import type { Request, Response } from "express";
import { database } from "../database/prisma";
import { redisConnection } from "../config/redis";
import { checkWorkerHealth } from "./worker-client";
import { failure, success } from "../utils/api-response";

export async function healthCheck(_req: Request, res: Response) {
  const [db, redis, worker] = await Promise.allSettled([
    database.$queryRaw`SELECT 1`,
    redisConnection.ping(),
    checkWorkerHealth(),
  ]);

  const checks = {
    db: db.status === "fulfilled",
    redis: redis.status === "fulfilled",
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
