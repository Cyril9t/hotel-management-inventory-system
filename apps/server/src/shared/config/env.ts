import { config } from "@dotenvx/dotenvx";
import { cleanEnv, str, port, url, num } from "envalid";

config({ path: ".env", quiet: true });
config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
  quiet: true,
  override: true,
});

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

  REDIS_URL: str(),
  REDIS_HOST: str({ devDefault: "127.0.0.1" }),
  REDIS_PORT: port({ default: 6379 }),
  REDIS_PASSWORD: str({ devDefault: undefined }),

  CLIENT_ORIGIN: url({ devDefault: "http://localhost:5173" }),
  BASED_URL: url({ devDefault: "http://localhost:3000" }),

  RESEND_API_KEY: str(),
  RESEND_FROM_EMAIL: str(),

  BCRYPT_SALT_ROUNDS: num({ default: 12 }),
});
