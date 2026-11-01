import { createServer } from "node:http";
import { database } from "../database/prisma";
import { boss } from "../config/pgboss";
import { AUTO_CHECKOUT_QUEUE } from "../jobs/auto-checkout/auto-checkout.queue";
import { logger } from "#shared/logger";

export function startWorkerHealthServer(port: number) {
  const server = createServer(async (req, res) => {
    const start = Date.now();

    res.on("finish", () => {
      logger.info(
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
        },
        "worker health server request",
      );
    });

    if (req.url !== "/health") {
      res.writeHead(404).end();
      return;
    }

    const [db, pgboss] = await Promise.allSettled([
      database.$queryRaw`SELECT 1`,
      boss.getQueue(AUTO_CHECKOUT_QUEUE),
    ]);

    const checks = {
      db: db.status === "fulfilled",
      pgboss: pgboss.status === "fulfilled" && pgboss.value != null,
    };
    const ok = Object.values(checks).every(Boolean);

    if (!ok) {
      logger.warn(
        {
          checks,
          dbError: db.status === "rejected" ? db.reason : undefined,
          pgbossError: pgboss.status === "rejected" ? pgboss.reason : undefined,
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
