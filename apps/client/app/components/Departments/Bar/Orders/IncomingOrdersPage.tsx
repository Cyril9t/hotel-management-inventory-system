import { useMemo, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useBarOrders } from "./BarOrdersContext";
import { IncomingOrderSummary } from "./IncomingOrderSummary";
import { IncomingOrderFilters, type OrderFilter } from "./IncomingOrderFilters";
import { IncomingOrdersTable } from "./IncomingOrdersTable";
import { IncomingOrderDetails } from "./IncomingOrderDetails";
import type { BarIncomingOrder } from "../types";

export function IncomingOrdersPage() {
  const { orders, markDelivered } = useBarOrders();
  const [filter, setFilter] = useState<OrderFilter>("All Orders");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<BarIncomingOrder | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const visibleOrders = useMemo(() => orders.filter((order) => (filter === "All Orders" || order.status === filter) && order.reference.toLowerCase().includes(search.toLowerCase())), [orders, filter, search]);

  return <div className="mx-auto w-full max-w-[1600px] space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-muted-foreground">Bar Operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Incoming Orders</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">View orders received by the Bar and mark them delivered when they arrive.</p></div><div className="flex items-center gap-3"><span className="hidden text-xs text-muted-foreground md:inline">{lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5"/>Live local preview</span>}</span><Button variant="outline" size="sm" onClick={() => setLastRefresh(new Date())}><RefreshCw/>Refresh</Button></div></header>
    <IncomingOrderSummary orders={orders} selected={filter} onSelect={setFilter}/>
    <Card className="overflow-hidden"><div className="space-y-4 border-b border-border p-4 sm:p-5"><div><h2 className="text-lg font-semibold">Orders received</h2><p className="mt-1 text-sm text-muted-foreground">Search orders and review their delivery status.</p></div><IncomingOrderFilters filter={filter} onFilter={setFilter} search={search} onSearch={setSearch}/></div><IncomingOrdersTable orders={visibleOrders} onSelect={setSelectedOrder}/></Card>
    <IncomingOrderDetails order={selectedOrder ? orders.find((order) => order.id === selectedOrder.id) ?? selectedOrder : null} onClose={() => setSelectedOrder(null)} onMarkDelivered={markDelivered}/>
  </div>;
}
