import type { AxiosInstance } from "axios";

export const kitchenOrderStatuses = ["INCOMING", "PREPARING", "READY", "DELIVERED", "VOIDED"] as const;
export type KitchenOrderStatus = (typeof kitchenOrderStatuses)[number];
export type KitchenOrderTransition = "PREPARING" | "READY" | "DELIVERED";

export interface KitchenOrderItem {
    id: string;
    kitchenOrderId: string;
    productId: string;
    quantity: number;
    unitPriceAtOrder: string;
    product?: { id: string; name: string };
}

export interface KitchenOrder {
    id: string;
    saleId: string;
    destination: string;
    status: KitchenOrderStatus;
    createdByUserId: string;
    createdAt: string;
    items: KitchenOrderItem[];
}

export interface KitchenOrderDetails extends KitchenOrder {
    items: Array<KitchenOrderItem & { product: { id: string; name: string } }>;
    sale: { id: string; sourceDepartment: string };
}

interface ApiEnvelope<T> {
    success: true;
    data: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is KitchenOrderStatus {
    return typeof value === "string" && kitchenOrderStatuses.includes(value as KitchenOrderStatus);
}

function parseOrderItem(value: unknown, requireProduct: boolean): KitchenOrderItem {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.kitchenOrderId !== "string" ||
        typeof value.productId !== "string" || !Number.isInteger(value.quantity) || (value.quantity as number) < 0 ||
        typeof value.unitPriceAtOrder !== "string") {
        throw new Error("The Kitchen API returned an invalid order item.");
    }
    let product: KitchenOrderItem["product"];
    if (requireProduct) {
        if (!isRecord(value.product) || typeof value.product.id !== "string" || typeof value.product.name !== "string") {
            throw new Error("Kitchen order details did not include the documented product name.");
        }
        product = { id: value.product.id, name: value.product.name };
    }
    return {
        id: value.id,
        kitchenOrderId: value.kitchenOrderId,
        productId: value.productId,
        quantity: value.quantity as number,
        unitPriceAtOrder: value.unitPriceAtOrder,
        product,
    };
}

function parseOrder(value: unknown, requireDetails = false): KitchenOrder | KitchenOrderDetails {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.saleId !== "string" ||
        typeof value.destination !== "string" || !isStatus(value.status) || typeof value.createdByUserId !== "string" ||
        typeof value.createdAt !== "string" || !Array.isArray(value.items)) {
        throw new Error("The Kitchen API returned an invalid order.");
    }
    const items = value.items.map((item) => parseOrderItem(item, requireDetails));
    const order = {
        id: value.id,
        saleId: value.saleId,
        destination: value.destination,
        status: value.status,
        createdByUserId: value.createdByUserId,
        createdAt: value.createdAt,
        items,
    };
    if (!requireDetails) return order;
    if (!isRecord(value.sale) || typeof value.sale.id !== "string" || typeof value.sale.sourceDepartment !== "string") {
        throw new Error("Kitchen order details did not include the documented source department.");
    }
    return { ...order, items: items as KitchenOrderDetails["items"], sale: { id: value.sale.id, sourceDepartment: value.sale.sourceDepartment } };
}

export async function listKitchenOrders(api: AxiosInstance): Promise<KitchenOrder[]> {
    const response = await api.get<ApiEnvelope<{ kitchenOrders: unknown }>>("/kitchen-orders");
    const orders = response.data?.data?.kitchenOrders;
    if (!Array.isArray(orders)) throw new Error("The Kitchen API did not return an order list.");
    return orders.map((order) => parseOrder(order) as KitchenOrder);
}

export async function getKitchenOrderDetails(api: AxiosInstance, orderId: string): Promise<KitchenOrderDetails> {
    const response = await api.get<ApiEnvelope<{ kitchenOrder: unknown }>>(`/kitchen-orders/${encodeURIComponent(orderId)}`);
    const order = response.data?.data?.kitchenOrder;
    return parseOrder(order, true) as KitchenOrderDetails;
}

export function getNextKitchenOrderStatus(status: KitchenOrderStatus): KitchenOrderTransition | null {
    if (status === "INCOMING") return "PREPARING";
    if (status === "PREPARING") return "READY";
    if (status === "READY") return "DELIVERED";
    return null;
}

export async function updateKitchenOrderStatus(api: AxiosInstance, orderId: string, status: KitchenOrderTransition): Promise<void> {
    await api.patch(`/kitchen-orders/${encodeURIComponent(orderId)}/status`, { status });
}
