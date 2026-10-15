import { config } from "@dotenvx/dotenvx";
import { defineConfig } from "prisma/config";

config({ path: ".env", quiet: true });
config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
  quiet: true,
  override: true,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
