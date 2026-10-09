import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { httpLogger } from "./shared/config/logger";
import { errorHandler } from "./shared/middleware/error-handler";
import { env } from "./shared/config/env";
import { success } from "./shared/utils/api-response";
// import identityRouter from "./modules/identity/routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);

app.get("/health", (_req, res) => res.json(success({ status: "ok" })));

app.get("/", (_req, res) =>
  res.json(success({ message: "hotel management server running" })),
);

// app.use("/api/auth", identityRouter);

app.use(errorHandler);

export default app;
