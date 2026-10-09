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
  // Custom log messages instead of "request completed" / "request errored"
  customSuccessMessage: (req) => `${req.method} ${req.url}`,
  customErrorMessage: (req) => `${req.method} ${req.url}`,

  // Trim req and res output to only essential attributes
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  genReqId: (req) =>
    (req.headers["x-request-id"] as string) || crypto.randomUUID(),
});
