import { z } from "zod";
import { Department, StockMovementType, Role } from "@prisma/client";
import { apiSuccessSchema } from "#shared/utils/api-response";
import {
  badRequestErrorSchema,
  notFoundErrorSchema,
  forbiddenErrorSchema,
  unauthorizedErrorSchema,
} from "#shared/errors/http-error-schemas";
import {
  dateRangeShape,
  dateRangeRefinement,
} from "#shared/utils/date-range-schema";
import { publicUserSchema } from "../core/users/users.schema";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  department: z.enum(
    ["BAR", "RESTAURANT"],
    "Product department must be BAR or RESTAURANT",
  ),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  lowStockThreshold: z.coerce
    .number()
    .int()
    .nonnegative("Threshold cannot be negative")
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamsSchema = z.object({
  id: z.uuid("Invalid product id"),
});

export const listProductsQuerySchema = z.object({
  department: z.enum(["BAR", "RESTAURANT"], "Invalid department").optional(),
});

export const receiveStockSchema = z.object({
  productId: z.uuid("Invalid product id"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
});

export const issueStockSchema = z
  .object({
    productId: z.uuid("Invalid product id"),
    fromDepartment: z.enum(Department, "Invalid from department"),
    toDepartment: z.enum(Department, "Invalid to department"),
    quantity: z.coerce.number().int().positive("Quantity must be positive"),
  })
  .refine((data) => data.fromDepartment !== data.toDepartment, {
    message: "fromDepartment and toDepartment must differ",
    path: ["toDepartment"],
  });

export const correctionStockSchema = z.object({
  productId: z.uuid("Invalid product id"),
  department: z.enum(Department, "Invalid department"),
  adjustment: z.coerce
    .number()
    .int()
    .refine((v) => v !== 0, "Adjustment cannot be zero"),
  correctionReason: z.string().min(1, "Correction reason is required"),
});

export const acknowledgeMovementSchema = z.object({
  acknowledgedQuantity: z.coerce
    .number()
    .int()
    .nonnegative("Acknowledged quantity cannot be negative"),
});

export const movementIdParamsSchema = z.object({
  id: z.uuid("Invalid movement id"),
});

export const listBalancesQuerySchema = z.object({
  productId: z.uuid("Invalid product id").optional(),
  department: z.enum(Department, "Invalid department").optional(),
});

export const listMovementsQuerySchema = z
  .object({
    productId: z.uuid("Invalid product id").optional(),
    department: z.enum(Department, "Invalid department").optional(),
    movementType: z.enum(StockMovementType, "Invalid movement type").optional(),
    ...dateRangeShape,
  })
  .refine(dateRangeRefinement, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type ProductIdParams = z.infer<typeof productIdParamsSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type ReceiveStockBody = z.infer<typeof receiveStockSchema>;
export type IssueStockBody = z.infer<typeof issueStockSchema>;
export type CorrectionStockBody = z.infer<typeof correctionStockSchema>;
export type AcknowledgeMovementBody = z.infer<typeof acknowledgeMovementSchema>;
export type MovementIdParams = z.infer<typeof movementIdParamsSchema>;
export type ListBalancesQuery = z.infer<typeof listBalancesQuerySchema>;
export type ListMovementsQuery = z.infer<typeof listMovementsQuerySchema>;

// response record schemas

const productRecordSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  department: z.enum(Department),
  unitPrice: z.string(),
  lowStockThreshold: z.number().int(),
  isActive: z.boolean(),
  createdByUserId: z.uuid(),
  createdAt: z.iso.datetime(),
});

const stockBalanceRecordSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  department: z.enum(Department),
  quantity: z.number().int(),
  product: productRecordSchema,
});

const stockMovementRecordSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  movementType: z.enum(StockMovementType),
  fromDepartment: z.enum(Department).nullable(),
  toDepartment: z.enum(Department).nullable(),
  quantity: z.number().int(),
  actorUserId: z.uuid(),
  saleId: z.uuid().nullable(),
  kitchenOrderId: z.uuid().nullable(),
  correctionReason: z.string().nullable(),
  acknowledgedAt: z.iso.datetime().nullable(),
  acknowledgedByUserId: z.uuid().nullable(),
  acknowledgedQuantity: z.number().int().nullable(),
  createdAt: z.iso.datetime(),
});

// Only expose safe user fields in movement list responses.
const stockMovementActorSchema = publicUserSchema;

const stockMovementWithRelationsSchema = stockMovementRecordSchema.extend({
  product: productRecordSchema,
  actor: stockMovementActorSchema,
});

// ---- Product responses ----

export const productCreatedResponseSchema = apiSuccessSchema(
  z.object({
    product: productRecordSchema,
  }),
);

export const productsListResponseSchema = apiSuccessSchema(
  z.object({
    products: z.array(productRecordSchema),
  }),
);

export const productDetailsResponseSchema = apiSuccessSchema(
  z.object({
    product: productRecordSchema,
  }),
);

export const productUpdatedResponseSchema = apiSuccessSchema(
  z.object({
    product: productRecordSchema,
  }),
);

export const productDeactivatedResponseSchema = apiSuccessSchema(
  z.object({
    product: productRecordSchema,
  }),
);

export const productReactivatedResponseSchema = apiSuccessSchema(
  z.object({
    product: productRecordSchema,
  }),
);

// ---- Balance responses ----

export const stockBalancesListResponseSchema = apiSuccessSchema(
  z.object({
    balances: z.array(stockBalanceRecordSchema),
  }),
);

// ---- Movement responses ----

export const stockReceivedResponseSchema = apiSuccessSchema(
  z.object({
    movement: stockMovementRecordSchema,
  }),
);

export const stockIssuedResponseSchema = apiSuccessSchema(
  z.object({
    movement: stockMovementRecordSchema,
  }),
);

export const stockCorrectionResponseSchema = apiSuccessSchema(
  z.object({
    movement: stockMovementRecordSchema,
  }),
);

export const stockMovementAcknowledgedResponseSchema = apiSuccessSchema(
  z.object({
    movement: stockMovementRecordSchema,
  }),
);

export const stockMovementsListResponseSchema = apiSuccessSchema(
  z.object({
    movements: z.array(stockMovementWithRelationsSchema),
  }),
);

// ---- Error responses ----

// Product errors
export const productNotFoundResponse = notFoundErrorSchema("Product not found");
export const stockBadRequestResponse = badRequestErrorSchema("Bad request");
export const stockUnauthorizedResponse =
  unauthorizedErrorSchema("Unauthorized");
export const stockForbiddenResponse = forbiddenErrorSchema("Forbidden");
export const stockNotFoundResponse = notFoundErrorSchema("Not found");

// Movement errors
export const stockMovementNotFoundResponse = notFoundErrorSchema(
  "Stock movement not found",
);

export const insufficientStockResponse = badRequestErrorSchema(
  "Insufficient stock for this product",
);

export const correctionBelowZeroResponse = badRequestErrorSchema(
  "Correction would take stock below zero",
);

export const kitchenMovementOnlyResponse = badRequestErrorSchema(
  "Only kitchen-bound issues can be acknowledged",
);

export const movementAlreadyAcknowledgedResponse = badRequestErrorSchema(
  "This movement has already been acknowledged",
);

export const acknowledgedQuantityExceedsIssuedResponse = badRequestErrorSchema(
  "Acknowledged quantity cannot exceed the issued quantity",
);

export const cannotAcknowledgeMovementResponse = forbiddenErrorSchema(
  "You cannot acknowledge this movement",
);
