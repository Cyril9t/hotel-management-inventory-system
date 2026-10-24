import { z } from "zod";
import { Department, StockMovementType } from "@prisma/client";
import {
  dateRangeShape,
  dateRangeRefinement,
} from "#shared/utils/date-range-schema";

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
