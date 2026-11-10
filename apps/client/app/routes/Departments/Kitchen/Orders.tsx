import { useState } from "react";
import { KitchenOrdersTable } from "~/components/Departments/Kitchen/Orders/KitchenOrdersTable";
import { OrderDetailsDrawer } from "~/components/Departments/Kitchen/OrderDetails/OrderDetailsDrawer";
import { useKitchenOperations } from "~/Context/KitchenOperationsContext";
import type { KitchenOrder } from "~/services/kitchen";

export default function KitchenOrdersPage() {
    const { orders, orderDetails, orderDetailErrors, orderDetailsLoading, orderLoading, orderError, pendingOrderIds, refreshOrders, loadOrderDetails, advanceOrder } = useKitchenOperations();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

    async function selectOrder(order: KitchenOrder) {
        setSelectedOrderId(order.id);
        setDrawerOpen(true);
        try { await loadOrderDetails(order.id); } catch { /* Drawer shows retry state. */ }
    }

    async function retryDetails() {
        if (!selectedOrderId) return;
        try { await loadOrderDetails(selectedOrderId); } catch { /* Drawer shows retry state. */ }
    }

    return <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <header><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Kitchen Orders</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Review order details and move tickets through preparation and delivery.</p></header>
        <KitchenOrdersTable orders={orders} loading={orderLoading} error={orderError} pendingOrderIds={pendingOrderIds} onRefresh={() => { void refreshOrders(); }} onSelectOrder={selectOrder} onAdvanceStatus={advanceOrder} />
        <OrderDetailsDrawer order={selectedOrder} details={selectedOrderId ? orderDetails[selectedOrderId] ?? null : null} isOpen={drawerOpen} isLoading={selectedOrderId ? Boolean(orderDetailsLoading[selectedOrderId]) : false} error={selectedOrderId ? orderDetailErrors[selectedOrderId] ?? "" : ""} isPending={selectedOrderId ? pendingOrderIds.includes(selectedOrderId) : false} onClose={() => { setDrawerOpen(false); setSelectedOrderId(null); }} onRetry={() => { void retryDetails(); }} onAdvanceStatus={advanceOrder} />
    </div>;
}
