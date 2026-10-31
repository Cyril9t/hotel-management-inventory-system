import { Router } from "express";
import { stockController } from "./stock.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamsSchema,
  listProductsQuerySchema,
  receiveStockSchema,
  issueStockSchema,
  correctionStockSchema,
  acknowledgeMovementSchema,
  movementIdParamsSchema,
  listBalancesQuerySchema,
  listMovementsQuerySchema,

  // success responses
  productCreatedResponseSchema,
  productsListResponseSchema,
  productDetailsResponseSchema,
  productUpdatedResponseSchema,
  productDeactivatedResponseSchema,
  productReactivatedResponseSchema,
  stockBalancesListResponseSchema,
  stockReceivedResponseSchema,
  stockIssuedResponseSchema,
  stockCorrectionResponseSchema,
  stockMovementAcknowledgedResponseSchema,
  stockMovementsListResponseSchema,

  // error responses
  stockBadRequestResponse,
  stockUnauthorizedResponse,
  stockForbiddenResponse,
  stockNotFoundResponse,
  productNotFoundResponse,
  stockMovementNotFoundResponse,
  insufficientStockResponse,
  correctionBelowZeroResponse,
  kitchenMovementOnlyResponse,
  movementAlreadyAcknowledgedResponse,
  acknowledgedQuantityExceedsIssuedResponse,
  cannotAcknowledgeMovementResponse,
} from "./stock.schema";

export const stockRoutes = Router();

stockRoutes.use(authenticate);

// Products
// POST /stock/products
registry.registerPath({
  method: "post",
  path: "/stock/products",
  tags: ["Stock"],
  summary: "Create a new product",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createProductSchema } } },
  },
  responses: {
    201: {
      description: "Product created successfully",
      content: {
        "application/json": {
          schema: productCreatedResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: stockBadRequestResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.post(
  "/products",
  authorize("manage", "Product"),
  validate({ body: createProductSchema }),
  stockController.createProduct,
);

// GET /stock/products
registry.registerPath({
  method: "get",
  path: "/stock/products",
  tags: ["Stock"],
  summary: "List all products",
  security: [{ bearerAuth: [] }],
  request: {
    query: listProductsQuerySchema,
  },
  responses: {
    200: {
      description: "Products listed successfully",
      content: {
        "application/json": {
          schema: productsListResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.get(
  "/products",
  authorize("read", "Product"),
  validate({ query: listProductsQuerySchema }),
  stockController.listProducts,
);

// GET /stock/products/:id
registry.registerPath({
  method: "get",
  path: "/stock/products/{id}",
  tags: ["Stock"],
  summary: "Get product by ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: productIdParamsSchema,
  },
  responses: {
    200: {
      description: "Product retrieved successfully",
      content: {
        "application/json": {
          schema: productDetailsResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: productNotFoundResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.get(
  "/products/:id",
  authorize("read", "Product"),
  validate({ params: productIdParamsSchema }),
  stockController.getProductById,
);

// PATCH /stock/products/:id
registry.registerPath({
  method: "patch",
  path: "/stock/products/{id}",
  tags: ["Stock"],
  summary: "Update product details",
  security: [{ bearerAuth: [] }],
  request: {
    params: productIdParamsSchema,
    body: { content: { "application/json": { schema: updateProductSchema } } },
  },
  responses: {
    200: {
      description: "Product updated successfully",
      content: {
        "application/json": {
          schema: productUpdatedResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: stockBadRequestResponse,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: productNotFoundResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.patch(
  "/products/:id",
  authorize("manage", "Product"),
  validate({ params: productIdParamsSchema, body: updateProductSchema }),
  stockController.updateProduct,
);

// PATCH /stock/products/:id/deactivate
registry.registerPath({
  method: "patch",
  path: "/stock/products/{id}/deactivate",
  tags: ["Stock"],
  summary: "Deactivate a product",
  security: [{ bearerAuth: [] }],
  request: {
    params: productIdParamsSchema,
  },
  responses: {
    200: {
      description: "Product deactivated successfully",
      content: {
        "application/json": {
          schema: productDeactivatedResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: productNotFoundResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.patch(
  "/products/:id/deactivate",
  authorize("manage", "Product"),
  validate({ params: productIdParamsSchema }),
  stockController.deactivateProduct,
);

// PATCH /stock/products/:id/reactivate
registry.registerPath({
  method: "patch",
  path: "/stock/products/{id}/reactivate",
  tags: ["Stock"],
  summary: "Reactivate a product",
  security: [{ bearerAuth: [] }],
  request: {
    params: productIdParamsSchema,
  },
  responses: {
    200: {
      description: "Product reactivated successfully",
      content: {
        "application/json": {
          schema: productReactivatedResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: productNotFoundResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.patch(
  "/products/:id/reactivate",
  authorize("manage", "Product"),
  validate({ params: productIdParamsSchema }),
  stockController.reactivateProduct,
);

// Balances
// GET /stock/balances
registry.registerPath({
  method: "get",
  path: "/stock/balances",
  tags: ["Stock"],
  summary: "List stock balances",
  security: [{ bearerAuth: [] }],
  request: {
    query: listBalancesQuerySchema,
  },
  responses: {
    200: {
      description: "Balances listed successfully",
      content: {
        "application/json": {
          schema: stockBalancesListResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.get(
  "/balances",
  authorize("manage", "StockBalance"),
  validate({ query: listBalancesQuerySchema }),
  stockController.listBalances,
);

// Movements
// POST /stock/movements/receive
registry.registerPath({
  method: "post",
  path: "/stock/movements/receive",
  tags: ["Stock"],
  summary: "Receive stock into warehouse",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: receiveStockSchema } } },
  },
  responses: {
    201: {
      description: "Stock received successfully",
      content: {
        "application/json": {
          schema: stockReceivedResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: stockBadRequestResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: productNotFoundResponse,
        },
      },
    },
  },
});

stockRoutes.post(
  "/movements/receive",
  authorize("manage", "StockMovement"),
  validate({ body: receiveStockSchema }),
  stockController.receive,
);

// POST /stock/movements/issue
registry.registerPath({
  method: "post",
  path: "/stock/movements/issue",
  tags: ["Stock"],
  summary: "Issue stock from warehouse",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: issueStockSchema } } },
  },
  responses: {
    201: {
      description: "Stock issued successfully",
      content: {
        "application/json": {
          schema: stockIssuedResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input or insufficient stock",
      content: {
        "application/json": {
          schema: insufficientStockResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: productNotFoundResponse,
        },
      },
    },
  },
});

stockRoutes.post(
  "/movements/issue",
  authorize("manage", "StockMovement"),
  validate({ body: issueStockSchema }),
  stockController.issue,
);

// POST /stock/movements/correction
registry.registerPath({
  method: "post",
  path: "/stock/movements/correction",
  tags: ["Stock"],
  summary: "Correct stock balance",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: correctionStockSchema } },
    },
  },
  responses: {
    201: {
      description: "Stock correction processed successfully",
      content: {
        "application/json": {
          schema: stockCorrectionResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input or correction would take stock below zero",
      content: {
        "application/json": {
          schema: z.union([
            stockBadRequestResponse,
            correctionBelowZeroResponse,
          ]),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: productNotFoundResponse,
        },
      },
    },
  },
});

stockRoutes.post(
  "/movements/correction",
  authorize("manage", "StockMovement"),
  validate({ body: correctionStockSchema }),
  stockController.correction,
);

// PATCH /stock/movements/:id/acknowledge
registry.registerPath({
  method: "patch",
  path: "/stock/movements/{id}/acknowledge",
  tags: ["Stock"],
  summary: "Acknowledge a stock movement",
  security: [{ bearerAuth: [] }],
  request: {
    params: movementIdParamsSchema,
    body: {
      content: { "application/json": { schema: acknowledgeMovementSchema } },
    },
  },
  responses: {
    200: {
      description: "Movement acknowledged successfully",
      content: {
        "application/json": {
          schema: stockMovementAcknowledgedResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid acknowledgement",
      content: {
        "application/json": {
          schema: z.union([
            kitchenMovementOnlyResponse,
            movementAlreadyAcknowledgedResponse,
            acknowledgedQuantityExceedsIssuedResponse,
            stockBadRequestResponse,
          ]),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: cannotAcknowledgeMovementResponse,
        },
      },
    },
    404: {
      description: "Stock movement not found",
      content: {
        "application/json": {
          schema: stockMovementNotFoundResponse,
        },
      },
    },
  },
});

stockRoutes.patch(
  "/movements/:id/acknowledge",
  authorize("update", "StockMovement"),
  validate({ params: movementIdParamsSchema, body: acknowledgeMovementSchema }),
  stockController.acknowledge,
);

// GET /stock/movements
registry.registerPath({
  method: "get",
  path: "/stock/movements",
  tags: ["Stock"],
  summary: "List stock movements",
  security: [{ bearerAuth: [] }],
  request: {
    query: listMovementsQuerySchema,
  },
  responses: {
    200: {
      description: "Movements listed successfully",
      content: {
        "application/json": {
          schema: stockMovementsListResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: stockUnauthorizedResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: stockForbiddenResponse,
        },
      },
    },
  },
});

stockRoutes.get(
  "/movements",
  authorize("read", "StockMovement"),
  validate({ query: listMovementsQuerySchema }),
  stockController.listMovements,
);
