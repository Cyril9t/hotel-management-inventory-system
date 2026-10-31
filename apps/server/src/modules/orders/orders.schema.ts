import { z } from "zod";
import {
  Department,
  PaymentMethod,
  SaleStatus,
  PaymentState,
  KitchenOrderStatus,
} from "@prisma/client";
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

export const saleItemInputSchema = z.object({
  productId: z.uuid("Invalid product id"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
});

export const createSaleSchema = z.object({
  sourceDepartment: z.enum(["BAR", "RESTAURANT"], "Invalid source department"),
  items: z.array(saleItemInputSchema).min(1, "At least one item is required"),
  paymentMethod: z.enum(PaymentMethod, "Payment method is required"),
  chargeToRoomBookingId: z.uuid("Invalid booking id").optional(),
});

export const saleIdParamsSchema = z.object({
  id: z.uuid("Invalid sale id"),
});

export const listSalesQuerySchema = z
  .object({
    sourceDepartment: z
      .enum(["BAR", "RESTAURANT"], "Invalid source department")
      .optional(),
    status: z.enum(SaleStatus, "Invalid status").optional(),
    paymentState: z.enum(PaymentState, "Invalid payment state").optional(),
    ...dateRangeShape,
  })
  .refine(dateRangeRefinement, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const requestVoidSchema = z.object({
  voidReason: z.string().min(1, "Void reason is required"),
});

export const kitchenOrderIdParamsSchema = z.object({
  id: z.uuid("Invalid kitchen order id"),
});

export const updateKitchenOrderStatusSchema = z.object({
  status: z.enum(
    ["PREPARING", "READY", "DELIVERED"],
    "Invalid kitchen order status",
  ),
});

export const listKitchenOrdersQuerySchema = z
  .object({
    status: z
      .enum(KitchenOrderStatus, "Invalid kitchen order status")
      .optional(),
    ...dateRangeShape,
  })
  .refine(dateRangeRefinement, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export type SaleItemInput = z.infer<typeof saleItemInputSchema>;
export type CreateSaleBody = z.infer<typeof createSaleSchema>;
export type SaleIdParams = z.infer<typeof saleIdParamsSchema>;
export type ListSalesQuery = z.infer<typeof listSalesQuerySchema>;
export type RequestVoidBody = z.infer<typeof requestVoidSchema>;
export type KitchenOrderIdParams = z.infer<typeof kitchenOrderIdParamsSchema>;
export type UpdateKitchenOrderStatusBody = z.infer<
  typeof updateKitchenOrderStatusSchema
>;
export type ListKitchenOrdersQuery = z.infer<
  typeof listKitchenOrdersQuerySchema
>;

// Response record schemas

export const saleRecordSchema = z.object({
  id: z.uuid(),
  sourceDepartment: z.enum(Department),
  totalAmount: z.string(),
  paymentMethod: z.enum(PaymentMethod),
  paymentState: z.enum(PaymentState),
  chargeToRoomBookingId: z.uuid().nullable(),
  status: z.enum(SaleStatus),
  voidReason: z.string().nullable(),
  voidedByUserId: z.uuid().nullable(),
  approvedByUserId: z.uuid().nullable(),
  voidedAt: z.iso.datetime().nullable(),
  settledAt: z.iso.datetime().nullable(),
  settledByUserId: z.uuid().nullable(),
  shiftId: z.uuid(),
  createdByUserId: z.uuid(),
  createdAt: z.iso.datetime(),
});

export const saleItemRecordSchema = z.object({
  id: z.uuid(),
  saleId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int(),
  unitPriceAtSale: z.string(),
  lineTotal: z.string(),
});

export const productRecordSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  department: z.enum(Department),
  unitPrice: z.string(),
  lowStockThreshold: z.number().int(),
  isActive: z.boolean(),
  createdByUserId: z.uuid(),
  createdAt: z.iso.datetime(),
});

export const saleItemWithProductSchema = saleItemRecordSchema.extend({
  product: productRecordSchema,
});

export const saleWithItemsSchema = saleRecordSchema.extend({
  items: z.array(saleItemRecordSchema),
});

export const saleDetailsSchema = saleRecordSchema.extend({
  items: z.array(saleItemWithProductSchema),
  kitchenOrder: z
    .object({
      id: z.uuid(),
      saleId: z.uuid(),
      destination: z.string(),
      status: z.enum(KitchenOrderStatus),
      createdByUserId: z.uuid(),
      createdAt: z.iso.datetime(),
    })
    .nullable(),
});

// Kitchen order response schemas

export const kitchenOrderRecordSchema = z.object({
  id: z.uuid(),
  saleId: z.uuid(),
  destination: z.string(),
  status: z.enum(KitchenOrderStatus),
  createdByUserId: z.uuid(),
  createdAt: z.iso.datetime(),
});

export const kitchenOrderItemRecordSchema = z.object({
  id: z.uuid(),
  kitchenOrderId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int(),
  unitPriceAtOrder: z.string(),
});

export const kitchenOrderItemWithProductSchema =
  kitchenOrderItemRecordSchema.extend({
    product: productRecordSchema,
  });

export const kitchenOrderDetailsSchema = kitchenOrderRecordSchema.extend({
  items: z.array(kitchenOrderItemWithProductSchema),
  sale: saleRecordSchema,
});

export const kitchenOrderWithItemsSchema = kitchenOrderRecordSchema.extend({
  items: z.array(kitchenOrderItemRecordSchema),
});

// Success response schemas

export const saleCreatedResponseSchema = apiSuccessSchema(
  z.object({
    sale: saleRecordSchema,
    kitchenOrder: kitchenOrderRecordSchema.nullable(),
  }),
);

export const salesListResponseSchema = apiSuccessSchema(
  z.object({
    sales: z.array(saleWithItemsSchema),
  }),
);

export const saleDetailsResponseSchema = apiSuccessSchema(
  z.object({
    sale: saleDetailsSchema,
  }),
);

export const saleVoidRequestedResponseSchema = apiSuccessSchema(
  z.object({
    sale: saleRecordSchema,
  }),
);

export const saleVoidApprovedResponseSchema = apiSuccessSchema(
  z.object({
    sale: saleRecordSchema,
  }),
);

export const saleSettledResponseSchema = apiSuccessSchema(
  z.object({
    sale: saleRecordSchema,
  }),
);

export const kitchenOrdersListResponseSchema = apiSuccessSchema(
  z.object({
    kitchenOrders: z.array(kitchenOrderWithItemsSchema),
  }),
);

export const kitchenOrderDetailsResponseSchema = apiSuccessSchema(
  z.object({
    kitchenOrder: kitchenOrderDetailsSchema,
  }),
);

export const kitchenOrderStatusUpdatedResponseSchema = apiSuccessSchema(
  z.object({
    kitchenOrder: kitchenOrderRecordSchema,
  }),
);

// Generic error response schemas

export const ordersBadRequestResponse = badRequestErrorSchema("Bad request");
export const ordersUnauthorizedResponse =
  unauthorizedErrorSchema("Unauthorized");
export const ordersForbiddenResponse = forbiddenErrorSchema("Forbidden");
export const ordersNotFoundResponse = notFoundErrorSchema("Order not found");

// Operation-specific error response schemas

export const saleNotFoundResponse = notFoundErrorSchema("Sale not found");

export const kitchenOrderNotFoundResponse = notFoundErrorSchema(
  "Kitchen order not found",
);

export const bookingNotFoundResponse = notFoundErrorSchema("Booking not found");

export const saleNotCompletedResponse = badRequestErrorSchema(
  "Only completed sales can have a void requested",
);

export const pendingVoidRequestRequiredResponse = badRequestErrorSchema(
  "Sale does not have a pending void request",
);

export const cannotSettleSaleResponse = badRequestErrorSchema(
  "Only charge-to-room sales can be settled this way",
);

export const saleAlreadySettledResponse = badRequestErrorSchema(
  "Sale is already settled",
);

export const cannotSettleVoidedSaleResponse = badRequestErrorSchema(
  "Cannot settle a voided or void-requested sale",
);

export const kitchenOrderTransitionNotAllowedResponse = badRequestErrorSchema(
  "Cannot transition a kitchen order",
);
