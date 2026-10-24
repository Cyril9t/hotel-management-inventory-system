import { Router } from "express";
import { reportsController } from "./reports.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { apiSuccessSchema, apiFailureSchema } from "#shared/utils/api-response";
import { reportQuerySchema } from "./reports.schema";

export const reportsRoutes = Router();

reportsRoutes.use(authenticate);

// GET /reports
registry.registerPath({
  method: "get",
  path: "/reports",
  tags: ["Reports"],
  summary: "Get daily report snapshot",
  description: "Retrieves a financial and operational snapshot for a specific department on a given date.",
  security: [{ bearerAuth: [] }],
  request: {
    query: reportQuerySchema,
  },
  responses: {
    200: {
      description: "Report retrieved successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid query parameters",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

reportsRoutes.get(
  "/",
  authorize("read", "DailyReportSnapshot"),
  validate({ query: reportQuerySchema }),
  reportsController.getReport,
);
