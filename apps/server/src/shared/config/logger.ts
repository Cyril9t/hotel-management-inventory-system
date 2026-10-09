import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "../config/env";

const targets: pino.TransportTargetOptions[] = [
  env.isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname,service,env",
          singleLine: false,
          errorLikeObjectKeys: ["err", "error"],
          customColors: "info:cyan,warn:yellow,error:red,fatal:red",
          hideObject: false,
        },
      }
    : {
        target: "pino/file",
        options: { destination: 1 },
      },

  {
    target: "pino/file",
    options: {
      destination: "./logs/app.log",
      mkdir: true,
    },
  },
];

const transport = pino.transport({ targets });

export const logger = pino(
  {
    level: env.isTest ? "warn" : env.isDev ? "debug" : "info",
    base: {
      service: "hms-server",
      env: env.NODE_ENV,
    },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "password",
        "*.password",
        "token",
        "*.token",
      ],
      censor: "[REDACTED]",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

export const httpLogger = pinoHttp({
  logger,
  // Automatically select log level based on response status code
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // Auto-generate or reuse request IDs
  genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
});
