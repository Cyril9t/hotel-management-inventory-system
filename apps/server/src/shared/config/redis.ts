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

function attachConnectionHandlers(connection: Redis) {
  connection.on("connect", () => {
    logger.info("redis connected");
  });

  // connection.on("ready", () => {
  //   logger.info("redis: client ready and operational");
  // });

  // Required to prevent unhandled 'error' events from crashing the Node process
  connection.on("error", (err: any) => {
    logger.error(
      {
        error: {
          message: `redis error: ${err.message}`,
          stack: err.stack,
          code: err.code || "UNKNOWN",
          errno: err.errno,
          syscall: err.syscall,
          library: "ioredis",
        },
      },
      "redis connection error",
    );
  });
}

attachConnectionHandlers(redisConnection);

// BullMQ calls .duplicate() internally, which does not copy listeners.
// Overriding duplicate ensures all underlying BullMQ clients have handlers attached.
const originalDuplicate = redisConnection.duplicate.bind(redisConnection);
redisConnection.duplicate = (...args) => {
  const dup = originalDuplicate(...args);
  attachConnectionHandlers(dup);
  return dup;
};

// redisConnection.on("close", () =>
//   logger.warn("redis: shared connection closed"),
// );
redisConnection.on("reconnecting", () =>
  logger.warn("redis reconnecting"),
);
