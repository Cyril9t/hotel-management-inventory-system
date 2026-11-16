import type { AxiosInstance } from "axios";

type ApiSuccess<T> = { success: true; data: T };
export type BarProductRecord = { id: string; name: string; department: string; unitPrice: string; lowStockThreshold: number; isActive: boolean };
export type BarSaleRecord = {
  id: string; sourceDepartment: string; totalAmount: string; paymentMethod: "CASH" | "TRANSFER" | "CARD" | "CHARGE_TO_ROOM";
  paymentState: "UNPAID" | "PAID"; chargeToRoomBookingId: string | null; status: "COMPLETED" | "VOID_REQUESTED" | "VOIDED";
  voidReason: string | null; shiftId: string; createdByUserId: string; createdAt: string;
  items: Array<{ id: string; saleId: string; productId: string; quantity: number; unitPriceAtSale: string; lineTotal: string; product?: BarProductRecord }>;
};

export async function getBarProducts(api: AxiosInstance) {
  const { data } = await api.get<ApiSuccess<{ products: BarProductRecord[] }>>("/stock/products", { params: { department: "BAR" } });
  if (!Array.isArray(data?.data?.products)) throw new Error("Invalid Bar products response.");
  return data.data.products.filter((product) => product.isActive && product.department === "BAR");
}
export async function getBarSales(api: AxiosInstance, params: Record<string, string> = {}) {
  // The deployed Express app mounts ordersRoutes at /api/v1/orders; the OpenAPI paths omit this router prefix.
  const { data } = await api.get<ApiSuccess<{ sales: BarSaleRecord[] }>>("/orders/sales", { params: { sourceDepartment: "BAR", ...params } });
  if (!Array.isArray(data?.data?.sales)) throw new Error("Invalid Bar sales response.");
  return data.data.sales.filter((sale) => sale.sourceDepartment === "BAR");
}
export async function getBarSale(api: AxiosInstance, id: string) {
  const { data } = await api.get<ApiSuccess<{ sale: BarSaleRecord }>>(`/orders/sales/${encodeURIComponent(id)}`);
  if (data?.data?.sale?.sourceDepartment !== "BAR") throw new Error("This sale is not a Bar sale.");
  return data.data.sale;
}
export async function createBarSale(api: AxiosInstance, items: Array<{ productId: string; quantity: number }>, paymentMethod: BarSaleRecord["paymentMethod"], chargeToRoomBookingId?: string) {
  const { data } = await api.post<ApiSuccess<{ sale: BarSaleRecord }>>("/orders/sales", {
    sourceDepartment: "BAR", items, paymentMethod,
    ...(paymentMethod === "CHARGE_TO_ROOM" ? { chargeToRoomBookingId } : {}),
  });
  if (data?.data?.sale?.sourceDepartment !== "BAR") throw new Error("The API did not confirm a Bar sale.");
  return data.data.sale;
}
export async function requestBarSaleVoid(api: AxiosInstance, id: string, voidReason: string) {
  const { data } = await api.patch<ApiSuccess<{ sale: BarSaleRecord }>>(`/orders/sales/${encodeURIComponent(id)}/request-void`, { voidReason });
  return data.data.sale;
}
