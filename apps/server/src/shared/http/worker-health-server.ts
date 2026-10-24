import { createServer } from "node:http";
import { database } from "../database/prisma";
import { redisConnection } from "../config/redis";
import { logger } from "#shared/logger";

export function startWorkerHealthServer(port: number) {
  const server = createServer(async (req, res) => {
    if (req.url !== "/health") {
      res.writeHead(404).end();
      return;
    }

    const [db, redis] = await Promise.allSettled([
      database.$queryRaw`SELECT 1`,
      redisConnection.ping(),
    ]);

    const checks = {
      db: db.status === "fulfilled",
      redis: redis.status === "fulfilled",
    };
    const ok = Object.values(checks).every(Boolean);

    if (!ok) {
      logger.warn(
        {
          checks,
          dbError: db.status === "rejected" ? db.reason : undefined,
          redisError: redis.status === "rejected" ? redis.reason : undefined,
        },
        "worker health check degraded",
      );
    }

    res.writeHead(ok ? 200 : 503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: ok ? "ok" : "degraded", checks }));
  });

  server.listen(port, () => {
    logger.info({ port }, "worker health server listening");
  });

  return server;
}
