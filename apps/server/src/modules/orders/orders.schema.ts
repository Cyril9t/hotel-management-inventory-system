import { z } from "zod";
import {
  PaymentMethod,
  SaleStatus,
  PaymentState,
  KitchenOrderStatus,
} from "@prisma/client";

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

export const listSalesQuerySchema = z.object({
  sourceDepartment: z
    .enum(["BAR", "RESTAURANT"], "Invalid source department")
    .optional(),
  status: z.enum(SaleStatus, "Invalid status").optional(),
  paymentState: z.enum(PaymentState, "Invalid payment state").optional(),
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

export const listKitchenOrdersQuerySchema = z.object({
  status: z.enum(KitchenOrderStatus, "Invalid kitchen order status").optional(),
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
