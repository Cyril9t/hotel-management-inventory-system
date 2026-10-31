import { z } from "zod";
import { Department, PaymentMethod, KitchenOrderStatus } from "@prisma/client";
import { apiSuccessSchema } from "#shared/utils/api-response";
import {
  badRequestErrorSchema,
  unauthorizedErrorSchema,
  forbiddenErrorSchema,
} from "#shared/errors/http-error-schemas";

export const reportQuerySchema = z.object({
  reportDate: z.coerce.date(),
  department: z.enum(Department, "Invalid department"),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;

// Report record schemas

export const revenueByPaymentMethodSchema = z.object({
  paymentMethod: z.enum(PaymentMethod),
  total: z.number(),
});

export const shiftCashVarianceSchema = z.object({
  userId: z.uuid(),
  actualCash: z.number().nullable(),
  expectedCash: z.number().nullable(),
  variance: z.number().nullable(),
});

export const topProductSchema = z.object({
  productId: z.uuid(),
  quantitySold: z.number().int(),
});

export const kitchenOrderStatusCountSchema = z.object({
  status: z.enum(KitchenOrderStatus),
  count: z.number().int(),
});

export const issueDiscrepancySchema = z.object({
  movementId: z.uuid(),
  productId: z.uuid(),
  expectedQuantity: z.number().int(),
  acknowledgedQuantity: z.number().int(),
});

export const movementTypeSummarySchema = z.object({
  movementType: z.string(),
  count: z.number().int(),
  totalQuantity: z.number().int(),
});

export const lowStockProductSchema = z.object({
  productId: z.uuid(),
  name: z.string(),
  quantity: z.number().int(),
  lowStockThreshold: z.number().int(),
});

//  Dapartment report schema

export const receptionReportSchema = z.object({
  bookingsCreated: z.number().int(),
  bookingsCheckedIn: z.number().int(),
  bookingsCheckedOut: z.number().int(),
  revenueByPaymentMethod: z.array(revenueByPaymentMethodSchema),
  shiftCashVariance: z.array(shiftCashVarianceSchema),
});

export const salesReportSchema = z.object({
  salesCount: z.number().int(),
  revenue: z.number(),
  voidedSalesCount: z.number().int(),
  topProducts: z.array(topProductSchema),
  totalUnitsConsumed: z.number().int(),
});

export const kitchenReportSchema = z.object({
  ordersByStatus: z.array(kitchenOrderStatusCountSchema),
  issueDiscrepancies: z.array(issueDiscrepancySchema),
});

export const storeReportSchema = z.object({
  movementsByType: z.array(movementTypeSummarySchema),
  lowStockProducts: z.array(lowStockProductSchema),
});

// Success responses

export const reportDataSchema = z.union([
  receptionReportSchema,
  salesReportSchema,
  kitchenReportSchema,
  storeReportSchema,
]);

export const reportDetailsResponseSchema = apiSuccessSchema(
  z.object({
    report: reportDataSchema,
  }),
);

//  Error response

export const reportsBadRequestResponse = badRequestErrorSchema(
  "Invalid query parameters",
);

export const reportsUnauthorizedResponse =
  unauthorizedErrorSchema("Unauthorized");

export const reportsForbiddenResponse = forbiddenErrorSchema("Forbidden");
