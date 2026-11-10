import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { api } from "~/lib/api";
import { getKitchenOrderDetails, getNextKitchenOrderStatus, listKitchenOrders, updateKitchenOrderStatus, type KitchenOrder, type KitchenOrderDetails, type KitchenOrderTransition } from "~/services/kitchen";
import { acknowledgeKitchenMovement, getStockApiMessage, listStockMovements, type StockMovement } from "~/services/stock";

type KitchenOperationsValue = {
    orders: KitchenOrder[];
    orderDetails: Record<string, KitchenOrderDetails>;
    orderDetailErrors: Record<string, string>;
    orderDetailsLoading: Record<string, boolean>;
    orderLoading: boolean;
    orderError: string;
    pendingOrderIds: string[];
    refreshOrders: (quiet?: boolean) => Promise<void>;
    startOrderPolling: () => () => void;
    loadOrderDetails: (orderId: string) => Promise<KitchenOrderDetails>;
    advanceOrder: (orderId: string, nextStatus: KitchenOrderTransition) => Promise<void>;
    stockMovements: StockMovement[];
    stockLoading: boolean;
    stockError: string;
    pendingStockIds: string[];
    refreshStock: (force?: boolean) => Promise<void>;
    acknowledgeStock: (movementId: string, receivedQuantity: number) => Promise<void>;
};

const KitchenOperationsContext = createContext<KitchenOperationsValue | null>(null);

function apiMessage(error: any, fallback: string) {
    return error?.response?.data?.error?.message ?? error?.message ?? fallback;
}

export function KitchenOperationsProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const ordersRef = useRef<KitchenOrder[]>([]);
    const [orderDetails, setOrderDetails] = useState<Record<string, KitchenOrderDetails>>({});
    const orderDetailsRef = useRef<Record<string, KitchenOrderDetails>>({});
    const detailRequestsRef = useRef(new Map<string, Promise<KitchenOrderDetails>>());
    const [orderDetailErrors, setOrderDetailErrors] = useState<Record<string, string>>({});
    const [orderDetailsLoading, setOrderDetailsLoading] = useState<Record<string, boolean>>({});
    const [orderLoading, setOrderLoading] = useState(true);
    const [orderError, setOrderError] = useState("");
    const orderRequestRef = useRef<Promise<void> | null>(null);
    const ordersLoadedRef = useRef(false);
    const pendingOrderSet = useRef(new Set<string>());
    const [pendingOrderIds, setPendingOrderIds] = useState<string[]>([]);

    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const stockRef = useRef<StockMovement[]>([]);
    const [stockLoading, setStockLoading] = useState(false);
    const [stockError, setStockError] = useState("");
    const [pendingStockIds, setPendingStockIds] = useState<string[]>([]);
    const pendingStockSet = useRef(new Set<string>());
    const stockRequestRef = useRef<Promise<void> | null>(null);
    const stockLoadedRef = useRef(false);

    const loadOrderDetails = useCallback((orderId: string): Promise<KitchenOrderDetails> => {
        const cached = orderDetailsRef.current[orderId];
        if (cached) return Promise.resolve(cached);
        const inFlight = detailRequestsRef.current.get(orderId);
        if (inFlight) return inFlight;
        setOrderDetailsLoading((current) => ({ ...current, [orderId]: true }));
        setOrderDetailErrors((current) => ({ ...current, [orderId]: "" }));
        const request = getKitchenOrderDetails(api, orderId)
            .then((details) => {
                orderDetailsRef.current = { ...orderDetailsRef.current, [orderId]: details };
                setOrderDetails(orderDetailsRef.current);
                setOrderDetailErrors((current) => ({ ...current, [orderId]: "" }));
                return details;
            })
            .catch((error: any) => {
                setOrderDetailErrors((current) => ({ ...current, [orderId]: apiMessage(error, "Could not load order details.") }));
                throw error;
            })
            .finally(() => {
                detailRequestsRef.current.delete(orderId);
                setOrderDetailsLoading((current) => ({ ...current, [orderId]: false }));
            });
        detailRequestsRef.current.set(orderId, request);
        return request;
    }, []);

    const refreshOrders = useCallback((quiet = false): Promise<void> => {
        if (orderRequestRef.current) return orderRequestRef.current;
        if (!quiet) setOrderLoading(true);
        const request = (async () => {
            try {
                const nextOrders = await listKitchenOrders(api);
                ordersRef.current = nextOrders;
                setOrders(nextOrders);
                ordersLoadedRef.current = true;
                setOrderError("");
                const idsNeedingDetails = nextOrders
                    .filter((order) => ["INCOMING", "PREPARING", "READY"].includes(order.status))
                    .map((order) => order.id)
                    .filter((id) => !orderDetailsRef.current[id] && !detailRequestsRef.current.has(id));
                for (let index = 0; index < idsNeedingDetails.length; index += 5) {
                    await Promise.all(idsNeedingDetails.slice(index, index + 5).map((id) => loadOrderDetails(id).catch(() => null)));
                }
            } catch (error: any) {
                setOrderError(apiMessage(error, "Could not load kitchen orders."));
            } finally {
                setOrderLoading(false);
                orderRequestRef.current = null;
            }
        })();
        orderRequestRef.current = request;
        return request;
    }, [loadOrderDetails]);

    const startOrderPolling = useCallback(() => {
        if (!ordersLoadedRef.current) void refreshOrders();
        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") void refreshOrders(true);
        }, 20_000);
        return () => window.clearInterval(timer);
    }, [refreshOrders]);

    const advanceOrder = useCallback(async (orderId: string, nextStatus: KitchenOrderTransition) => {
        if (pendingOrderSet.current.has(orderId)) return;
        const order = ordersRef.current.find((item) => item.id === orderId);
        if (!order || getNextKitchenOrderStatus(order.status) !== nextStatus) {
            throw new Error("This order can no longer move to that status. Refresh and try again.");
        }
        pendingOrderSet.current.add(orderId);
        setPendingOrderIds(Array.from(pendingOrderSet.current));
        try {
            await updateKitchenOrderStatus(api, orderId, nextStatus);
            const updatedOrders = ordersRef.current.map((item) => item.id === orderId ? { ...item, status: nextStatus } : item);
            ordersRef.current = updatedOrders;
            setOrders(updatedOrders);
            const currentDetails = orderDetailsRef.current[orderId];
            if (currentDetails) {
                orderDetailsRef.current = { ...orderDetailsRef.current, [orderId]: { ...currentDetails, status: nextStatus } };
                setOrderDetails(orderDetailsRef.current);
            }
            setOrderError("");
            // Reconcile against the server after any list request already in flight settles.
            if (orderRequestRef.current) await orderRequestRef.current.catch(() => {});
            await refreshOrders(true);
        } finally {
            pendingOrderSet.current.delete(orderId);
            setPendingOrderIds(Array.from(pendingOrderSet.current));
        }
    }, [refreshOrders]);

    const refreshStock = useCallback((force = false): Promise<void> => {
        if (stockRequestRef.current) return stockRequestRef.current;
        if (stockLoadedRef.current && !force) return Promise.resolve();
        setStockLoading(true);
        setStockError("");
        const request = listStockMovements(api, { department: "KITCHEN", movementType: "ISSUE" })
            .then((movements) => {
                const kitchenIssues = movements.filter((movement) => movement.movementType === "ISSUE" && movement.toDepartment === "KITCHEN");
                stockRef.current = kitchenIssues;
                setStockMovements(kitchenIssues);
                stockLoadedRef.current = true;
            })
            .catch((error: any) => {
                setStockError(getStockApiMessage(error, "Could not load Kitchen stock deliveries."));
            })
            .finally(() => {
                stockRequestRef.current = null;
                setStockLoading(false);
            });
        stockRequestRef.current = request;
        return request;
    }, []);

    const acknowledgeStock = useCallback(async (movementId: string, receivedQuantity: number) => {
        if (!Number.isInteger(receivedQuantity) || receivedQuantity < 0) throw new Error("Enter a whole-number quantity of zero or more.");
        if (pendingStockSet.current.has(movementId)) return;
        const movement = stockRef.current.find((item) => item.id === movementId);
        if (!movement || movement.acknowledgedAt !== null || movement.acknowledgedQuantity !== null) {
            throw new Error("This stock delivery has already been acknowledged. Refresh the list to see its current state.");
        }
        pendingStockSet.current.add(movementId);
        setPendingStockIds(Array.from(pendingStockSet.current));
        try {
            const updated = await acknowledgeKitchenMovement(api, movementId, receivedQuantity);
            const nextMovements = stockRef.current.map((item) => item.id === movementId ? { ...item, ...updated } : item);
            stockRef.current = nextMovements;
            setStockMovements(nextMovements);
            setStockError("");
        } finally {
            pendingStockSet.current.delete(movementId);
            setPendingStockIds(Array.from(pendingStockSet.current));
        }
    }, []);

    const value = useMemo<KitchenOperationsValue>(() => ({
        orders, orderDetails, orderDetailErrors, orderDetailsLoading, orderLoading, orderError, pendingOrderIds,
        refreshOrders, startOrderPolling, loadOrderDetails, advanceOrder,
        stockMovements, stockLoading, stockError, pendingStockIds, refreshStock, acknowledgeStock,
    }), [orders, orderDetails, orderDetailErrors, orderDetailsLoading, orderLoading, orderError, pendingOrderIds,
        refreshOrders, startOrderPolling, loadOrderDetails, advanceOrder, stockMovements, stockLoading, stockError,
        pendingStockIds, refreshStock, acknowledgeStock]);

    return <KitchenOperationsContext.Provider value={value}>{children}</KitchenOperationsContext.Provider>;
}

export function useKitchenOperations() {
    const context = useContext(KitchenOperationsContext);
    if (!context) throw new Error("useKitchenOperations must be used inside KitchenOperationsProvider");
    return context;
}
