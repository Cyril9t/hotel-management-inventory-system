import { useMemo, useState } from "react";
import { CalendarClock, ChefHat } from "lucide-react";
import { KitchenMetricsGrid } from "./Overview/KitchenMetricsGrid";
import { KitchenShiftBanner } from "./Overview/KitchenShiftBanner";
import { KitchenOrdersTable } from "./Orders/KitchenOrdersTable";
import { OrderDetailsDrawer } from "./OrderDetails/OrderDetailsDrawer";
import { StockReceivingSection } from "./StockReceiving/StockReceivingSection";
import { useKitchenOperations } from "~/Context/KitchenOperationsContext";
import type { KitchenOrder } from "~/services/kitchen";

function isToday(value: string) {
    const date = new Date(value);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export function KitchenDashboard() {
    const {
        orders, orderDetails, orderDetailErrors, orderDetailsLoading, orderLoading, orderError,
        pendingOrderIds, refreshOrders, loadOrderDetails, advanceOrder,
    } = useKitchenOperations();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const metrics = useMemo(() => ({
        incomingCount: orders.filter((order) => order.status === "INCOMING").length,
        preparingCount: orders.filter((order) => order.status === "PREPARING").length,
        readyCount: orders.filter((order) => order.status === "READY").length,
        // The API has no deliveredAt field, so completion date cannot be counted accurately.
        completedTodayCount: null,
        totalTodayCount: orders.filter((order) => isToday(order.createdAt)).length,
    }), [orders]);

    const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

    async function selectOrder(order: KitchenOrder) {
        setSelectedOrderId(order.id);
        setDrawerOpen(true);
        try { await loadOrderDetails(order.id); } catch { /* Drawer presents the request error and retry action. */ }
    }

    async function retrySelectedDetails() {
        if (!selectedOrderId) return;
        try { await loadOrderDetails(selectedOrderId); } catch { /* Drawer presents the request error and retry action. */ }
    }

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="mt-1 rounded-xl bg-primary/10 p-3 text-primary"><ChefHat className="h-6 w-6" /></span>
                    <div><p className="text-sm font-medium text-muted-foreground">Kitchen Operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Kitchen Dashboard</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Review food orders, update preparation status, and verify stock issued to Kitchen.</p></div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4" />{new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</div>
            </header>

            <section aria-label="Kitchen order summary"><KitchenMetricsGrid metrics={metrics} /></section>
            <KitchenShiftBanner />

            <section aria-label="Kitchen orders"><KitchenOrdersTable
                orders={orders}
                loading={orderLoading}
                error={orderError}
                pendingOrderIds={pendingOrderIds}
                onRefresh={() => { void refreshOrders(); }}
                onSelectOrder={selectOrder}
                onAdvanceStatus={advanceOrder}
            /></section>

            <section aria-label="Kitchen stock receiving"><StockReceivingSection /></section>

            <OrderDetailsDrawer
                order={selectedOrder}
                details={selectedOrderId ? orderDetails[selectedOrderId] ?? null : null}
                isOpen={drawerOpen}
                isLoading={selectedOrderId ? Boolean(orderDetailsLoading[selectedOrderId]) : false}
                error={selectedOrderId ? orderDetailErrors[selectedOrderId] ?? "" : ""}
                isPending={selectedOrderId ? pendingOrderIds.includes(selectedOrderId) : false}
                onClose={() => { setDrawerOpen(false); setSelectedOrderId(null); }}
                onRetry={() => { void retrySelectedDetails(); }}
                onAdvanceStatus={advanceOrder}
            />
        </div>
    );
}
