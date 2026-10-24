import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { httpLogger } from "#shared/logger";
import { errorHandler } from "#shared/middleware/error-handler";
import { notFoundHandler } from "#shared/middleware/notfound-handler";
import { corsOptions } from "#shared/config/cors";
import { authRoutes } from "#modules/core/auth/auth.routes";
import { usersRoutes } from "#modules/core/users/users.routes";
import { generateOpenApiDocument } from "#shared/openapi/generate";
import { env } from "#shared/config/env";
import { roomsRoutes } from "#modules/rooms/rooms.routes";
import { bookingsRoutes } from "#modules/bookings/bookings.routes";
import { shiftsRoutes } from "#modules/shifts/shifts.routes";
import { stockRoutes } from "#modules/stock/stock.routes";
import { healthCheck } from "./shared/http/health";
import { ordersRoutes } from "./modules/orders/orders.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";

// const API_PREFIX = "/api/v1";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);

app.get("/", healthCheck);
app.get("/health", healthCheck);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

app.use("/api/v1/bookings", bookingsRoutes);
app.use("/api/v1/rooms", roomsRoutes);

app.use("/api/v1/shifts", shiftsRoutes);

app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/orders", ordersRoutes);

app.use("/api/v1/reports", reportsRoutes);

const openApiDocument = generateOpenApiDocument();
// if (env.isDev) {
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/api/docs.json", (_req, res) => res.json(openApiDocument));
// }

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
