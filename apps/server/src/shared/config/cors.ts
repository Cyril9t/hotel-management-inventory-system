import { type CorsOptions } from "cors";
import { env } from "./env";
import { CorsError } from "../errors/http-errors";

const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((origin) =>
  origin.trim(),
);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new CorsError(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  maxAge: 600,
} satisfies CorsOptions;
