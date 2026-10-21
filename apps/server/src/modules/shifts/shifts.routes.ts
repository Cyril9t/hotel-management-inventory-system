import { Router } from "express";
import { shiftsController } from "./shifts.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { apiSuccessSchema, apiFailureSchema } from "#shared/utils/api-response";
import {
  openShiftSchema,
  closeShiftSchema,
  shiftIdParamsSchema,
  listShiftsQuerySchema,
} from "./shifts.schema";

export const shiftsRoutes = Router();

shiftsRoutes.use(authenticate);

// GET /shifts/current
registry.registerPath({
  method: "get",
  path: "/shifts/current",
  tags: ["Shifts"],
  summary: "Get my current open shift",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current open shift",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "No open shift",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});
shiftsRoutes.get(
  "/current",
  authorize("read", "Shift"),
  shiftsController.getCurrent,
);

// GET /shifts/suggested-opening-cash
registry.registerPath({
  method: "get",
  path: "/shifts/suggested-opening-cash",
  tags: ["Shifts"],
  summary: "Get suggested opening cash",
  description:
    "Returns the previous closed shift's actual cash for this user, to pre-fill opening cash.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Suggested opening cash",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});
shiftsRoutes.get(
  "/suggested-opening-cash",
  authorize("read", "Shift"),
  shiftsController.getSuggestedOpeningCash,
);

// POST /shifts/open
registry.registerPath({
  method: "post",
  path: "/shifts/open",
  tags: ["Shifts"],
  summary: "Open a new shift",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: openShiftSchema } } },
  },
  responses: {
    201: {
      description: "Shift opened",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Already has an open shift",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});
shiftsRoutes.post(
  "/open",
  authorize("create", "Shift"),
  validate({ body: openShiftSchema }),
  shiftsController.open,
);

// PATCH /shifts/:id/close
registry.registerPath({
  method: "patch",
  path: "/shifts/{id}/close",
  tags: ["Shifts"],
  summary: "Close a shift",
  security: [{ bearerAuth: [] }],
  request: {
    params: shiftIdParamsSchema,
    body: { content: { "application/json": { schema: closeShiftSchema } } },
  },
  responses: {
    200: {
      description: "Shift closed",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Shift not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});
shiftsRoutes.patch(
  "/:id/close",
  authorize("update", "Shift"),
  validate({ params: shiftIdParamsSchema, body: closeShiftSchema }),
  shiftsController.close,
);

// GET /shifts/:id
registry.registerPath({
  method: "get",
  path: "/shifts/{id}",
  tags: ["Shifts"],
  summary: "Get shift details",
  security: [{ bearerAuth: [] }],
  request: { params: shiftIdParamsSchema },
  responses: {
    200: {
      description: "Shift details",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Shift not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});
shiftsRoutes.get(
  "/:id",
  authorize("read", "Shift"),
  validate({ params: shiftIdParamsSchema }),
  shiftsController.getById,
);

// GET /shifts
registry.registerPath({
  method: "get",
  path: "/shifts",
  tags: ["Shifts"],
  summary: "List shifts",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of shifts",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});
shiftsRoutes.get(
  "/",
  authorize("read", "Shift"),
  validate({ query: listShiftsQuerySchema }),
  shiftsController.list,
);
