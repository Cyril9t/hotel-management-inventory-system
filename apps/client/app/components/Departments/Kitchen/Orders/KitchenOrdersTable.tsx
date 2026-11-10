import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, Flame, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useKitchenOperations } from "~/Context/KitchenOperationsContext";
import { getNextKitchenOrderStatus, type KitchenOrder, type KitchenOrderStatus, type KitchenOrderTransition } from "~/services/kitchen";
import { KitchenOrderStatusBadge } from "./KitchenOrderStatusBadge";

type OrderFilter = "ACTIVE" | "ALL" | KitchenOrderStatus;
type Props = {
    orders: KitchenOrder[];
    loading: boolean;
    error: string;
    pendingOrderIds: string[];
    onRefresh: () => void;
    onSelectOrder: (order: KitchenOrder) => void;
    onAdvanceStatus: (orderId: string, status: KitchenOrderTransition) => Promise<void>;
    title?: string;
};

function formatPlacedAt(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function KitchenOrdersTable({ orders, loading, error, pendingOrderIds, onRefresh, onSelectOrder, onAdvanceStatus, title = "Kitchen Orders" }: Props) {
    const { orderDetails, orderDetailErrors, orderDetailsLoading, startOrderPolling } = useKitchenOperations();
    const [filter, setFilter] = useState<OrderFilter>("ACTIVE");
    const [actionError, setActionError] = useState("");

    useEffect(() => startOrderPolling(), [startOrderPolling]);

    const visibleOrders = useMemo(() => {
        if (filter === "ACTIVE") return orders.filter((order) => ["INCOMING", "PREPARING", "READY"].includes(order.status));
        if (filter === "ALL") return orders;
        return orders.filter((order) => order.status === filter);
    }, [filter, orders]);

    async function advance(order: KitchenOrder, nextStatus: KitchenOrderTransition) {
        setActionError("");
        try {
            await onAdvanceStatus(order.id, nextStatus);
        } catch (error: any) {
            setActionError(error?.response?.data?.error?.message ?? error?.message ?? "Could not update this order.");
        }
    }

    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Prepare and dispatch incoming food orders. Payment collection remains with Restaurant.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="kitchen-order-filter" className="sr-only">Filter kitchen orders</label>
                    <select id="kitchen-order-filter" value={filter} onChange={(event) => setFilter(event.target.value as OrderFilter)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                        <option value="ACTIVE">Active orders</option>
                        <option value="ALL">All orders</option>
                        <option value="INCOMING">Incoming</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY">Ready</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="VOIDED">Voided</option>
                    </select>
                    <Button type="button" variant="outline" onClick={onRefresh} disabled={loading} className="h-9 gap-2">
                        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Refresh
                    </Button>
                </div>
            </div>

            {error && <div role="alert" className="flex flex-col gap-2 border-b border-destructive/20 bg-destructive/5 px-5 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span><button type="button" onClick={onRefresh} className="self-start font-semibold underline sm:self-auto">Retry</button>
            </div>}
            {actionError && <p role="alert" className="border-b border-destructive/20 px-5 py-3 text-sm text-destructive">{actionError}</p>}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                    <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th scope="col" className="px-5 py-4">Order</th>
                            <th scope="col" className="px-4 py-4">From</th>
                            <th scope="col" className="px-4 py-4">For</th>
                            <th scope="col" className="px-4 py-4">Items</th>
                            <th scope="col" className="px-4 py-4">Placed</th>
                            <th scope="col" className="px-4 py-4">Status</th>
                            <th scope="col" className="px-5 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && orders.length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Loading kitchen orders…</span></td></tr>
                            : error && orders.length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">Orders could not be loaded. Retry the request above.</td></tr>
                            : visibleOrders.length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center">
                                <p className="font-medium text-foreground">{filter === "ACTIVE" ? "No active kitchen orders" : "No orders in this view"}</p>
                                <p className="mt-1 text-sm text-muted-foreground">New orders will appear here automatically while this page is open.</p>
                            </td></tr>
                                : visibleOrders.map((order) => {
                                    const details = orderDetails[order.id];
                                    const items = details?.items ?? order.items;
                                    const nextStatus = getNextKitchenOrderStatus(order.status);
                                    const pending = pendingOrderIds.includes(order.id);
                                    const requester = details?.sale.sourceDepartment ?? `Requester ID ${order.createdByUserId.slice(0, 8)}`;
                                    return <tr key={order.id} className="align-top transition-colors hover:bg-muted/20">
                                        <td className="px-5 py-4">
                                            <button type="button" onClick={() => onSelectOrder(order)} className="text-left font-mono font-semibold text-primary underline-offset-4 hover:underline" title={order.id}>#{order.id.slice(0, 8)}</button>
                                            <p className="mt-1 text-xs text-muted-foreground" title={order.saleId}>Sale ID {order.saleId.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-4 py-4 text-foreground">{requester}</td>
                                        <td className="max-w-40 px-4 py-4 text-foreground">{order.destination.trim() || "Not provided"}</td>
                                        <td className="max-w-64 px-4 py-4">
                                            {orderDetailsLoading[order.id] && !details ? <span className="text-xs text-muted-foreground">Loading item names…</span>
                                                : items.length ? <ul className="space-y-1.5">{items.slice(0, 3).map((item) => <li key={item.id} className="text-foreground"><span className="font-medium">{item.product?.name ?? `Product ID ${item.productId.slice(0, 8)}`}</span><span className="ml-2 whitespace-nowrap text-muted-foreground">× {item.quantity}</span></li>)}{items.length > 3 && <li className="text-xs text-muted-foreground">+{items.length - 3} more · <button type="button" onClick={() => onSelectOrder(order)} className="text-primary underline">view all</button></li>}</ul>
                                                    : <span className="text-xs text-muted-foreground">No items listed</span>}
                                            {!details && orderDetailErrors[order.id] && <p className="mt-1 text-xs text-destructive">Item names unavailable. <button type="button" onClick={() => onSelectOrder(order)} className="underline">Retry details</button></p>}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatPlacedAt(order.createdAt)}</td>
                                        <td className="px-4 py-4"><KitchenOrderStatusBadge status={order.status} size="sm" /></td>
                                        <td className="px-5 py-4">
                                            <div className="flex min-w-36 flex-col items-end gap-2">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => onSelectOrder(order)} className="h-8 gap-1.5 text-xs"><Eye className="h-3.5 w-3.5" />Details</Button>
                                                {nextStatus && <Button type="button" size="sm" disabled={pending} onClick={() => void advance(order, nextStatus)} className="h-9 gap-1.5 text-xs">
                                                    {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : order.status === "INCOMING" ? <Flame className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                                                    {pending ? "Updating…" : order.status === "INCOMING" ? "Start preparing" : order.status === "PREPARING" ? "Mark ready" : "Mark delivered"}
                                                </Button>}
                                            </div>
                                        </td>
                                    </tr>;
                                })}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Updates check automatically every 20 seconds while this tab is visible.</div>
        </section>
    );
}
