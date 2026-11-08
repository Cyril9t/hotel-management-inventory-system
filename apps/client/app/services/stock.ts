import type { AxiosInstance } from "axios";

export const stockDepartments = ["RECEPTION", "BAR", "RESTAURANT", "KITCHEN", "STORE"] as const;
export type StockDepartment = (typeof stockDepartments)[number];
export type ProductSalesDepartment = "BAR" | "RESTAURANT";
export type StockMovementType = "RECEIVE" | "ISSUE" | "SALE_DEDUCTION" | "CORRECTION";

export interface StockProduct {
    id: string;
    name: string;
    /** Sales department; physical stock location is StockBalance.department. */
    department: ProductSalesDepartment;
    unitPrice: string;
    lowStockThreshold: number;
    isActive: boolean;
    createdByUserId: string;
    createdAt: string;
}

export interface StockBalance {
    id: string;
    productId: string;
    department: StockDepartment;
    quantity: number;
    product: StockProduct;
}

export interface StockActor {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
    department?: StockDepartment | null;
    isActive?: boolean;
    createdAt?: string;
    deactivatedAt?: string | null;
}

export interface StockMovement {
    id: string;
    productId: string;
    movementType: StockMovementType;
    fromDepartment: StockDepartment | null;
    toDepartment: StockDepartment | null;
    quantity: number;
    actorUserId: string;
    saleId: string | null;
    kitchenOrderId: string | null;
    correctionReason: string | null;
    acknowledgedAt: string | null;
    acknowledgedByUserId: string | null;
    acknowledgedQuantity: number | null;
    createdAt: string;
    product?: StockProduct;
    actor?: StockActor;
}

export interface CreateStockProduct {
    name: string;
    department: ProductSalesDepartment;
    unitPrice: number;
    lowStockThreshold?: number;
}

export type UpdateStockProduct = Partial<CreateStockProduct>;

export interface IssueStock {
    productId: string;
    fromDepartment: StockDepartment;
    toDepartment: StockDepartment;
    quantity: number;
}

export interface CorrectStock {
    productId: string;
    department: StockDepartment;
    adjustment: number;
    correctionReason: string;
}

export interface ReceiveStock {
    productId: string;
    quantity: number;
}

export interface StockMovementFilters {
    productId?: string;
    department?: StockDepartment;
    movementType?: StockMovementType;
    startDate?: string;
    endDate?: string;
}

interface ApiSuccess<T> {
    success: true;
    data: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStockDepartment(value: unknown): value is StockDepartment {
    return typeof value === "string" && stockDepartments.includes(value as StockDepartment);
}

function isProductSalesDepartment(value: unknown): value is ProductSalesDepartment {
    return value === "BAR" || value === "RESTAURANT";
}

function parseProduct(value: unknown): StockProduct {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string" ||
        !isProductSalesDepartment(value.department) || typeof value.unitPrice !== "string" ||
        !Number.isInteger(value.lowStockThreshold) || typeof value.isActive !== "boolean" ||
        typeof value.createdByUserId !== "string" || typeof value.createdAt !== "string") {
        throw new Error("The stock API returned an invalid product record.");
    }
    return value as unknown as StockProduct;
}

function parseBalance(value: unknown): StockBalance {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.productId !== "string" ||
        !isStockDepartment(value.department) || !Number.isInteger(value.quantity)) {
        throw new Error("The stock API returned an invalid balance record.");
    }
    return { ...(value as unknown as StockBalance), product: parseProduct(value.product) };
}

function parseActor(value: unknown): StockActor {
    if (!isRecord(value) || typeof value.id !== "string") {
        throw new Error("The stock API returned an invalid actor record.");
    }
    return value as unknown as StockActor;
}

function parseMovement(value: unknown, withRelations = false): StockMovement {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.productId !== "string" ||
        !["RECEIVE", "ISSUE", "SALE_DEDUCTION", "CORRECTION"].includes(String(value.movementType)) ||
        !(value.fromDepartment === null || isStockDepartment(value.fromDepartment)) ||
        !(value.toDepartment === null || isStockDepartment(value.toDepartment)) ||
        !Number.isInteger(value.quantity) || typeof value.actorUserId !== "string" ||
        typeof value.createdAt !== "string") {
        throw new Error("The stock API returned an invalid movement record.");
    }
    const movement = value as unknown as StockMovement;
    if (!withRelations) return movement;
    return { ...movement, product: parseProduct(value.product), actor: parseActor(value.actor) };
}

function responseData<T>(value: unknown, key: string): T {
    if (!isRecord(value) || value.success !== true || !isRecord(value.data) || !(key in value.data)) {
        throw new Error("The stock API returned an unexpected response.");
    }
    return value.data[key] as T;
}

export async function listStockProducts(api: AxiosInstance): Promise<StockProduct[]> {
    const response = await api.get<ApiSuccess<{ products: unknown }>>("/stock/products");
    const products = responseData<unknown>(response.data, "products");
    if (!Array.isArray(products)) throw new Error("The stock API did not return a product list.");
    return products.map(parseProduct);
}

export async function createStockProduct(api: AxiosInstance, data: CreateStockProduct): Promise<StockProduct> {
    const response = await api.post<ApiSuccess<{ product: unknown }>>("/stock/products", data);
    return parseProduct(responseData(response.data, "product"));
}

export async function updateStockProduct(api: AxiosInstance, id: string, data: UpdateStockProduct): Promise<StockProduct> {
    const response = await api.patch<ApiSuccess<{ product: unknown }>>(`/stock/products/${encodeURIComponent(id)}`, data);
    return parseProduct(responseData(response.data, "product"));
}

export async function deactivateStockProduct(api: AxiosInstance, id: string): Promise<StockProduct> {
    const response = await api.patch<ApiSuccess<{ product: unknown }>>(`/stock/products/${encodeURIComponent(id)}/deactivate`);
    return parseProduct(responseData(response.data, "product"));
}

export async function reactivateStockProduct(api: AxiosInstance, id: string): Promise<StockProduct> {
    const response = await api.patch<ApiSuccess<{ product: unknown }>>(`/stock/products/${encodeURIComponent(id)}/reactivate`);
    return parseProduct(responseData(response.data, "product"));
}

export async function listStockBalances(api: AxiosInstance, department?: StockDepartment): Promise<StockBalance[]> {
    const response = await api.get<ApiSuccess<{ balances: unknown }>>("/stock/balances", {
        params: department ? { department } : undefined,
    });
    const balances = responseData<unknown>(response.data, "balances");
    if (!Array.isArray(balances)) throw new Error("The stock API did not return a balance list.");
    return balances.map(parseBalance);
}

export async function issueStock(api: AxiosInstance, data: IssueStock): Promise<StockMovement> {
    const response = await api.post<ApiSuccess<{ movement: unknown }>>("/stock/movements/issue", data);
    return parseMovement(responseData(response.data, "movement"));
}

export async function correctStock(api: AxiosInstance, data: CorrectStock): Promise<StockMovement> {
    const response = await api.post<ApiSuccess<{ movement: unknown }>>("/stock/movements/correction", data);
    return parseMovement(responseData(response.data, "movement"));
}

export async function receiveStock(api: AxiosInstance, data: ReceiveStock): Promise<StockMovement> {
    const response = await api.post<ApiSuccess<{ movement: unknown }>>("/stock/movements/receive", data);
    return parseMovement(responseData<unknown>(response.data, "movement"));
}

export async function acknowledgeKitchenMovement(
    api: AxiosInstance,
    movementId: string,
    acknowledgedQuantity: number,
): Promise<StockMovement> {
    const response = await api.patch<ApiSuccess<{ movement: unknown }>>(
        `/stock/movements/${encodeURIComponent(movementId)}/acknowledge`,
        { acknowledgedQuantity },
    );
    return parseMovement(responseData(response.data, "movement"));
}

export async function listStockMovements(
    api: AxiosInstance,
    filters: StockMovementFilters = {},
): Promise<StockMovement[]> {
    const response = await api.get<ApiSuccess<{ movements: unknown }>>("/stock/movements", { params: filters });
    const movements = responseData<unknown>(response.data, "movements");
    if (!Array.isArray(movements)) throw new Error("The stock API did not return a movement list.");
    return movements.map((movement) => parseMovement(movement, true));
}

export function getStockApiMessage(error: unknown, fallback: string): string {
    if (!isRecord(error)) return fallback;
    const response = isRecord(error.response) ? error.response : undefined;
    const status = response?.status;
    if (status === 401) return "Your session could not be verified. Sign in again and retry.";
    if (status === 403) return "Your account is not permitted to perform this stock operation.";
    const body = isRecord(response?.data) ? response.data : undefined;
    const apiError = isRecord(body?.error) ? body.error : undefined;
    return typeof apiError?.message === "string" ? apiError.message : fallback;
}
