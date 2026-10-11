import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { httpLogger } from "#shared/logger";
import { errorHandler } from "#shared/middleware/error-handler";
import { notFoundHandler } from "#shared/middleware/notfound-handler";
import { corsOptions } from "#shared/config/cors";
import { success } from "#shared/utils/api-response";
import testRouter from "#modules/_test/test.routes";
import { authRoutes } from "#modules/core/auth/auth.routes";
import { usersRoutes } from "#modules/core/users/users.routes";
import { generateOpenApiDocument } from "#shared/openapi/generate";
import { env } from "#shared/config/env";

// const API_PREFIX = "/api/v1";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);

app.get("/health", (_req, res) =>
  res.json(
    success({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
  ),
);

app.get("/", (_req, res) =>
  res.json(success({ message: "hotel management server running" })),
);

app.use("/api/v1/test", testRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

if (env.isDev) {
  const openApiDocument = generateOpenApiDocument();
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/api/docs.json", (_req, res) => res.json(openApiDocument));
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
