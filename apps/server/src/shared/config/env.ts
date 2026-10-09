import { config } from "@dotenvx/dotenvx";
import { cleanEnv, str, port, url, num } from "envalid";

config({ quiet: true });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: port({ default: 3000 }),

  DATABASE_URL: str({
    desc: "Pooled Postgres connection used by the app at runtime",
  }),
  DIRECT_URL: str({
    desc: "Direct (unpooled) Postgres connection used by Prisma migrations",
  }),

  JWT_ACCESS_SECRET: str({
    desc: "Signing secret for short-lived access tokens",
  }),
  JWT_REFRESH_SECRET: str({
    desc: "Signing secret for refresh tokens (stored in httpOnly cookie)",
  }),
  JWT_ACCESS_EXPIRES_IN: str({ default: "15m" }),
  JWT_REFRESH_EXPIRES_IN: str({ default: "7d" }),

  REDIS_URL: str({
    default: "redis://localhost:6379",
    desc: "Used by BullMQ queues",
  }),

  CLIENT_ORIGIN: url({
    default: "http://localhost:5173",
    desc: "CORS origin for the web app",
  }),

  RESEND_API_KEY: str({
    desc: "For password-recovery/temp-credential transactional emails",
  }),

  BCRYPT_SALT_ROUNDS: num({ default: 12 }),
});
