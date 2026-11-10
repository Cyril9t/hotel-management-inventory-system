import React, { useState, useMemo } from "react";
import { KitchenOrderColumn } from "./KitchenOrderColumn";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Clock,
  Flame,
  CheckCircle2,
  PackageCheck,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import type { KitchenOrder, KitchenOrderStatus } from "../types";

export interface KitchenOrdersBoardProps {
  orders: KitchenOrder[];
  onSelectOrder?: (order: KitchenOrder) => void;
  onAdvanceStatus?: (orderId: string, nextStatus: KitchenOrderStatus) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const KitchenOrdersBoard: React.FC<KitchenOrdersBoardProps> = ({
  orders,
  onSelectOrder,
  onAdvanceStatus,
  onRefresh,
  isRefreshing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ROOM" | "TABLE">("ALL");

  // Filter orders by search & location
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Location filter
      if (filterType === "ROOM" && !order.roomNumber) return false;
      if (filterType === "TABLE" && !order.tableNumber) return false;

      // Search query (Ref, item name, room, table, waiter)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const matchesRef = order.orderRef.toLowerCase().includes(q);
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesRoom = order.roomNumber?.toLowerCase().includes(q);
      const matchesTable = order.tableNumber?.toLowerCase().includes(q);
      const matchesStaff = order.createdByStaffName.toLowerCase().includes(q);
      const matchesItems = order.items.some((i) =>
        i.productName.toLowerCase().includes(q)
      );

      return (
        matchesRef ||
        matchesId ||
        matchesRoom ||
        matchesTable ||
        matchesStaff ||
        matchesItems
      );
    });
  }, [orders, searchQuery, filterType]);

  // Group into the four required Kanban columns
  const incomingOrders = filteredOrders.filter((o) => o.status === "INCOMING");
  const preparingOrders = filteredOrders.filter((o) => o.status === "PREPARING");
  const readyOrders = filteredOrders.filter((o) => o.status === "READY");
  const deliveredOrders = filteredOrders.filter((o) => o.status === "DELIVERED");

  return (
    <div className="space-y-4">
      {/* Board Controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ref, dish name, room, or table..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === "ALL"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Destination
            </button>
            <button
              type="button"
              onClick={() => setFilterType("ROOM")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === "ROOM"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Room Service
            </button>
            <button
              type="button"
              onClick={() => setFilterType("TABLE")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === "TABLE"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dine-in Tables
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 gap-1.5 text-xs shrink-0"
            title="Refresh active tickets"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4 Columns Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {/* Column 1: Incoming */}
        <KitchenOrderColumn
          status="INCOMING"
          title="Incoming"
          icon={<Clock className="size-4 animate-pulse text-amber-500" />}
          orders={incomingOrders}
          variant="warning"
          onSelectOrder={onSelectOrder}
          onAdvanceStatus={onAdvanceStatus}
        />

        {/* Column 2: Preparing */}
        <KitchenOrderColumn
          status="PREPARING"
          title="Preparing"
          icon={<Flame className="size-4 text-blue-500" />}
          orders={preparingOrders}
          variant="info"
          onSelectOrder={onSelectOrder}
          onAdvanceStatus={onAdvanceStatus}
        />

        {/* Column 3: Ready for Pickup */}
        <KitchenOrderColumn
          status="READY"
          title="Ready for Pickup"
          icon={<CheckCircle2 className="size-4 text-emerald-500" />}
          orders={readyOrders}
          variant="success"
          onSelectOrder={onSelectOrder}
          onAdvanceStatus={onAdvanceStatus}
        />

        {/* Column 4: Delivered */}
        <KitchenOrderColumn
          status="DELIVERED"
          title="Delivered"
          icon={<PackageCheck className="size-4 text-muted-foreground" />}
          orders={deliveredOrders}
          variant="muted"
          onSelectOrder={onSelectOrder}
          onAdvanceStatus={onAdvanceStatus}
        />
      </div>
    </div>
  );
};
