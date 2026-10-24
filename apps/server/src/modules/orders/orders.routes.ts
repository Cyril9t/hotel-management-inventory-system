import { Router } from "express";
import { ordersController } from "./orders.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { apiSuccessSchema, apiFailureSchema } from "#shared/utils/api-response";
import {
  createSaleSchema,
  saleIdParamsSchema,
  listSalesQuerySchema,
  requestVoidSchema,
  kitchenOrderIdParamsSchema,
  updateKitchenOrderStatusSchema,
  listKitchenOrdersQuerySchema,
} from "./orders.schema";
import type { Role } from "@prisma/client";

export const ordersRoutes = Router();

ordersRoutes.use(authenticate);

// Sales
// POST /sales
registry.registerPath({
  method: "post",
  path: "/sales",
  tags: ["Orders"],
  summary: "Create a new sale",
  description: "Registers a sale for products. Supports direct payment or charging to a room booking.",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createSaleSchema } } },
  },
  responses: {
    201: {
      description: "Sale created successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

ordersRoutes.post(
  "/sales",
  authorize("create", "Sale"),
  validate({ body: createSaleSchema }),
  ordersController.create,
);

// GET /sales
registry.registerPath({
  method: "get",
  path: "/sales",
  tags: ["Orders"],
  summary: "List sales",
  description: "Retrieves a list of sales with optional filters for department, status, and payment state.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listSalesQuerySchema,
  },
  responses: {
    200: {
      description: "List of sales retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});

ordersRoutes.get(
  "/sales",
  authorize("read", "Sale"),
  validate({ query: listSalesQuerySchema }),
  ordersController.list,
);

// GET /sales/{id}
registry.registerPath({
  method: "get",
  path: "/sales/{id}",
  tags: ["Orders"],
  summary: "Get sale details",
  description: "Retrieves detailed information about a specific sale by its ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: saleIdParamsSchema,
  },
  responses: {
    200: {
      description: "Sale details retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

ordersRoutes.get(
  "/sales/:id",
  authorize("read", "Sale"),
  validate({ params: saleIdParamsSchema }),
  ordersController.getById,
);

// PATCH /sales/{id}/request-void
registry.registerPath({
  method: "patch",
  path: "/sales/{id}/request-void",
  tags: ["Orders"],
  summary: "Request to void a sale",
  description: "Initiates a request to void a sale. Requires a reason for the void.",
  security: [{ bearerAuth: [] }],
  request: {
    params: saleIdParamsSchema,
    body: { content: { "application/json": { schema: requestVoidSchema } } },
  },
  responses: {
    200: {
      description: "Void request submitted successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

ordersRoutes.patch(
  "/sales/:id/request-void",
  authorize("void", "Sale"),
  validate({ params: saleIdParamsSchema, body: requestVoidSchema }),
  ordersController.requestVoid,
);

// PATCH /sales/{id}/approve-void
registry.registerPath({
  method: "patch",
  path: "/sales/{id}/approve-void",
  tags: ["Orders"],
  summary: "Approve a void request",
  description: "Approves a previously requested void, effectively canceling the sale.",
  security: [{ bearerAuth: [] }],
  request: {
    params: saleIdParamsSchema,
  },
  responses: {
    200: {
      description: "Void approved successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

ordersRoutes.patch(
  "/sales/:id/approve-void",
  authorize("void", "Sale"),
  validate({ params: saleIdParamsSchema }),
  ordersController.approveVoid,
);

// PATCH /sales/{id}/settle
registry.registerPath({
  method: "patch",
  path: "/sales/{id}/settle",
  tags: ["Orders"],
  summary: "Settle a sale",
  description: "Marks a sale as settled (payment completed).",
  security: [{ bearerAuth: [] }],
  request: {
    params: saleIdParamsSchema,
  },
  responses: {
    200: {
      description: "Sale settled successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

ordersRoutes.patch(
  "/sales/:id/settle",
  authorize("update", "Sale"),
  validate({ params: saleIdParamsSchema }),
  ordersController.settle,
);

// GET /kitchen-orders
registry.registerPath({
  method: "get",
  path: "/kitchen-orders",
  tags: ["Orders"],
  summary: "List kitchen orders",
  description: "Retrieves a list of current kitchen orders, optionally filtered by status.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listKitchenOrdersQuerySchema,
  },
  responses: {
    200: {
      description: "List of kitchen orders retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});

ordersRoutes.get(
  "/kitchen-orders",
  authorize("read", "KitchenOrder"),
  validate({ query: listKitchenOrdersQuerySchema }),
  ordersController.listKitchenOrders,
);

// GET /kitchen-orders/{id}
registry.registerPath({
  method: "get",
  path: "/kitchen-orders/{id}",
  tags: ["Orders"],
  summary: "Get kitchen order details",
  description: "Retrieves detailed information about a specific kitchen order by its ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: kitchenOrderIdParamsSchema,
  },
  responses: {
    200: {
      description: "Kitchen order details retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Kitchen order not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

ordersRoutes.get(
  "/kitchen-orders/:id",
  authorize("read", "KitchenOrder"),
  validate({ params: kitchenOrderIdParamsSchema }),
  ordersController.getKitchenOrderById,
);

// PATCH /kitchen-orders/{id}/status
registry.registerPath({
  method: "patch",
  path: "/kitchen-orders/{id}/status",
  tags: ["Orders"],
  summary: "Update kitchen order status",
  description: "Updates the status of a kitchen order (e.g., PREPARING, READY, DELIVERED).",
  security: [{ bearerAuth: [] }],
  request: {
    params: kitchenOrderIdParamsSchema,
    body: { content: { "application/json": { schema: updateKitchenOrderStatusSchema } } },
  },
  responses: {
    200: {
      description: "Kitchen order status updated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: apiFailureSchema } },
    },
    404: {
      description: "Kitchen order not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

ordersRoutes.patch(
  "/kitchen-orders/:id/status",
  authorize("update", "KitchenOrder"),
  validate({
    params: kitchenOrderIdParamsHema,
    body: updateKitchenOrderStatusSchema,
  }),
  ordersController.updateKitchenOrderStatus,
);
