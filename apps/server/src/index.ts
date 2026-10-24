import { createServer } from "node:http";
import app from "./app";
import { env } from "./shared/config/env";
import { logger } from "./shared/logger";
import { database } from "./shared/database/prisma";
import { scheduleAutoCheckoutJob } from "./shared/jobs/auto-checkout/auto-checkout.queue";
import { scheduleDailyReportJob } from "./shared/jobs/daily-report/daily-report.queue";
import { initSocket } from "./shared/realtime/socket";
import { registerAuditListeners } from "./modules/audit/audit.listener";
import { registerRealtimeListeners } from "./shared/realtime/invalidate";

const port = env.PORT;

try {
  await database.$queryRaw`SELECT 1`;
  logger.info("database connected");

  await scheduleAutoCheckoutJob();
  await scheduleDailyReportJob();
  logger.info("jobs scheduled");
} catch (err) {
  logger.fatal({ error: err }, "database connection failed");
  process.exit(1);
}

const httpServer = createServer(app);

initSocket(httpServer);
registerAuditListeners();
registerRealtimeListeners();

const server = httpServer.listen(port, () => {
  logger.info({ port }, `server listening on port ${port}`);
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "shutting down");
  server.close(async (err) => {
    if (err) {
      logger.error({ error: err }, "server close error");
      process.exit(1);
    }
    await database.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
