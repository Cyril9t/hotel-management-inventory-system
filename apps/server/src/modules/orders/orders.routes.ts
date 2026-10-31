import { Router } from "express";
import { ordersController } from "./orders.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { z } from "zod";
import {
  createSaleSchema,
  saleIdParamsSchema,
  listSalesQuerySchema,
  requestVoidSchema,
  kitchenOrderIdParamsSchema,
  updateKitchenOrderStatusSchema,
  listKitchenOrdersQuerySchema,

  // success responses
  saleCreatedResponseSchema,
  salesListResponseSchema,
  saleDetailsResponseSchema,
  saleVoidRequestedResponseSchema,
  saleVoidApprovedResponseSchema,
  saleSettledResponseSchema,
  kitchenOrdersListResponseSchema,
  kitchenOrderDetailsResponseSchema,
  kitchenOrderStatusUpdatedResponseSchema,

  // error responses
  ordersBadRequestResponse,
  ordersUnauthorizedResponse,
  ordersForbiddenResponse,
  ordersNotFoundResponse,
  saleNotFoundResponse,
  kitchenOrderNotFoundResponse,
  bookingNotFoundResponse,
  saleNotCompletedResponse,
  pendingVoidRequestRequiredResponse,
  cannotSettleSaleResponse,
  saleAlreadySettledResponse,
  cannotSettleVoidedSaleResponse,
  kitchenOrderTransitionNotAllowedResponse,
} from "./orders.schema";

export const ordersRoutes = Router();

ordersRoutes.use(authenticate);

// Sales
// POST /sales
registry.registerPath({
  method: "post",
  path: "/sales",
  tags: ["Orders"],
  summary: "Create a new sale",
  description:
    "Registers a sale for products. Supports direct payment or charging to a room booking.",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createSaleSchema } } },
  },
  responses: {
    201: {
      description: "Sale created successfully",
      content: { "application/json": { schema: saleCreatedResponseSchema } },
    },
    400: {
      description: "Invalid request or sale cannot be completed",
      content: { "application/json": { schema: ordersBadRequestResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ordersForbiddenResponse } },
    },
    404: {
      description: "Booking or product not found",
      content: { "application/json": { schema: ordersNotFoundResponse } },
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
  description:
    "Retrieves a list of sales with optional filters for department, status, and payment state.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listSalesQuerySchema,
  },
  responses: {
    200: {
      description: "List of sales retrieved",
      content: { "application/json": { schema: salesListResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ordersForbiddenResponse } },
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
  description:
    "Retrieves detailed information about a specific sale by its ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: saleIdParamsSchema,
  },
  responses: {
    200: {
      description: "Sale details retrieved",
      content: { "application/json": { schema: saleDetailsResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ordersForbiddenResponse } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: saleNotFoundResponse } },
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
  description:
    "Initiates a request to void a sale. Requires a reason for the void.",
  security: [{ bearerAuth: [] }],
  request: {
    params: saleIdParamsSchema,
    body: { content: { "application/json": { schema: requestVoidSchema } } },
  },
  responses: {
    200: {
      description: "Void request submitted successfully",
      content: {
        "application/json": { schema: saleVoidRequestedResponseSchema },
      },
    },
    400: {
      description: "Sale cannot be voided",
      content: { "application/json": { schema: saleNotCompletedResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "You cannot void this sale",
      content: { "application/json": { schema: ordersForbiddenResponse } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: saleNotFoundResponse } },
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
  description:
    "Approves a previously requested void, effectively canceling the sale.",
  security: [{ bearerAuth: [] }],
  request: {
    params: saleIdParamsSchema,
  },
  responses: {
    200: {
      description: "Void approved successfully",
      content: {
        "application/json": { schema: saleVoidApprovedResponseSchema },
      },
    },
    400: {
      description: "Sale has no pending void request",
      content: {
        "application/json": { schema: pendingVoidRequestRequiredResponse },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "You cannot approve this void",
      content: { "application/json": { schema: ordersForbiddenResponse } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: saleNotFoundResponse } },
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
      content: { "application/json": { schema: saleSettledResponseSchema } },
    },
    400: {
      description: "Sale cannot be settled",
      content: {
        "application/json": {
          schema: z.union([
            cannotSettleSaleResponse,
            cannotSettleVoidedSaleResponse,
            saleAlreadySettledResponse,
          ]),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "You cannot settle this sale",
      content: { "application/json": { schema: ordersForbiddenResponse } },
    },
    404: {
      description: "Sale not found",
      content: { "application/json": { schema: saleNotFoundResponse } },
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
  description:
    "Retrieves a list of current kitchen orders, optionally filtered by status.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listKitchenOrdersQuerySchema,
  },
  responses: {
    200: {
      description: "List of kitchen orders retrieved",
      content: {
        "application/json": { schema: kitchenOrdersListResponseSchema },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ordersForbiddenResponse } },
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
  description:
    "Retrieves detailed information about a specific kitchen order by its ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: kitchenOrderIdParamsSchema,
  },
  responses: {
    200: {
      description: "Kitchen order details retrieved",
      content: {
        "application/json": { schema: kitchenOrderDetailsResponseSchema },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ordersForbiddenResponse } },
    },
    404: {
      description: "Kitchen order not found",
      content: {
        "application/json": { schema: kitchenOrderNotFoundResponse },
      },
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
  description:
    "Updates the status of a kitchen order (e.g., PREPARING, READY, DELIVERED).",
  security: [{ bearerAuth: [] }],
  request: {
    params: kitchenOrderIdParamsSchema,
    body: {
      content: {
        "application/json": { schema: updateKitchenOrderStatusSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Kitchen order status updated successfully",
      content: {
        "application/json": {
          schema: kitchenOrderStatusUpdatedResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request or kitchen order transition",
      content: { "application/json": { schema: ordersBadRequestResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ordersUnauthorizedResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ordersForbiddenResponse } },
    },
    404: {
      description: "Kitchen order not found",
      content: {
        "application/json": { schema: kitchenOrderNotFoundResponse },
      },
    },
  },
});

ordersRoutes.patch(
  "/kitchen-orders/:id/status",
  authorize("update", "KitchenOrder"),
  validate({
    params: kitchenOrderIdParamsSchema,
    body: updateKitchenOrderStatusSchema,
  }),
  ordersController.updateKitchenOrderStatus,
);
