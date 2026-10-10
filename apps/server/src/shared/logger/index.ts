import crypto from "node:crypto";
import path from "node:path";
import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "../config/env";
import type { HttpError } from "http-errors";

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
      destination: path.join(process.cwd(), "logs/app.log"),
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
        "passwordHash",
        "*.passwordHash",
        "token",
        "*.token",
        "refreshToken",
        "*.refreshToken",
      ],
      censor: "[REDACTED]",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

export const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req) => `${req.method} ${req.url}`,
  customErrorMessage: (req) => `${req.method} ${req.url}`,

  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => {
      const err = res.locals?.err as
        | HttpError<number>
        | undefined;

      if (!err) {
        return { statusCode: res.statusCode };
      }

      return {
        statusCode: res.statusCode,
        code: err.code ?? "INTERNAL_ERROR",
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        ...(res.statusCode >= 500 ? { stack: err.stack } : {}),
      };
    },
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  genReqId: (req) =>
    (req.headers["x-request-id"] as string) || crypto.randomUUID(),
});
