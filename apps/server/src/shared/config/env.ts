import { config } from "@dotenvx/dotenvx";
import { cleanEnv, str, port, url, num } from "envalid";

config({ quiet: true });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: port({ default: 3000 }),

  DATABASE_URL: str(),
  DIRECT_URL: str(),

  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_ACCESS_EXPIRES_IN: str({ default: "15m" }),
  JWT_REFRESH_EXPIRES_IN: str({ default: "7d" }),

  REDIS_URL: str({ default: "redis://localhost:6379" }),

  CLIENT_ORIGIN: url({ default: "http://localhost:5173" }),

  RESEND_API_KEY: str(),

  BCRYPT_SALT_ROUNDS: num({ default: 12 }),
});
