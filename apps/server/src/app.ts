import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { httpLogger } from "./shared/logger";
import { errorHandler } from "./shared/middleware/error-handler";
import { notFoundHandler } from "./shared/middleware/notfound-handler";
import { corsOptions } from "./shared/config/cors";
import { success } from "./shared/utils/api-response";
import testRouter from "./modules/_scratch/test.routes";
// import identityRouter from "./modules/identity/routes";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);

app.get("/health", (_req, res) => res.json(success({ status: "ok" })));

app.get("/", (_req, res) =>
  res.json(success({ message: "hotel management server running" })),
);

app.use("/api", testRouter);

// app.use("/api/auth", identityRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
