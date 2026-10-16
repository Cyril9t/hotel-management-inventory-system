import { Redis } from "ioredis";
import { env } from "./env";
import { logger } from "../logger";

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  },
});

function attachErrorHandler(connection: Redis) {
  connection.on("error", (err: any) => {
    // Wrap the error explicitly to ensure log aggregators parse all TCP metadata
    logger.error(
      {
        error: {
          message: `redis error: ${err.message}`,
          stack: err.stack, // Preserves TCP.onStreamRead stack
          code: err.code || "UNKNOWN", // Preserves 'ECONNRESET', 'ECONNREFUSED', etc.
          errno: err.errno, // Preserves -4077
          syscall: err.syscall, // Preserves 'read' or 'connect'
          library: "ioredis",
        },
      },
      "redis connection error",
    );
  });
}

attachErrorHandler(redisConnection);

// BullMQ internally calls `.duplicate()` on this connection to create the
// extra clients it needs (blocking reads, pub/sub subscriber). duplicate()
// copies constructor options but NOT listeners attached afterward — so
// without this, every connection BullMQ creates under the hood is
// unguarded even though the original instance has an error handler.
const originalDuplicate = redisConnection.duplicate.bind(redisConnection);
redisConnection.duplicate = (...args) => {
  const dup = originalDuplicate(...args);
  attachErrorHandler(dup);
  return dup;
};

// Diagnostics — temporary. Confirms whether the shared connection itself
// is cycling, or whether the ECONNRESETs are isolated to a duplicated
// connection the patch above now covers. Remove once confirmed either way.
redisConnection.on("close", () =>
  logger.warn("redis: shared connection closed"),
);
redisConnection.on("reconnecting", () =>
  logger.warn("redis: shared connection reconnecting"),
);
