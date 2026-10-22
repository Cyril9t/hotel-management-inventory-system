import { createServer } from "node:http";
import { database } from "../database/prisma";
import { redisConnection } from "../config/redis";

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

    res.writeHead(ok ? 200 : 503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: ok ? "ok" : "degraded", checks }));
  });

  server.listen(port);
  return server;
}
