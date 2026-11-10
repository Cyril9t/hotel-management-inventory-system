import React, { useState, useMemo } from "react";
import { KitchenMetricsGrid } from "./Overview/KitchenMetricsGrid";
import { KitchenShiftBanner } from "./Overview/KitchenShiftBanner";
import { KitchenOrdersBoard } from "./Orders/KitchenOrdersBoard";
import { OrderDetailsDrawer } from "./OrderDetails/OrderDetailsDrawer";
import { StockReceivingSection } from "./StockReceiving/StockReceivingSection";
import { KitchenShiftModal } from "./Shift/KitchenShiftModal";
import {
  initialKitchenOrders,
  initialStockDeliveries,
  initialShiftState,
} from "./mockData";
import type {
  KitchenOrder,
  KitchenOrderStatus,
  StockDeliveryItem,
  KitchenShiftState,
  KitchenMetrics,
} from "./types";

export const KitchenDashboard: React.FC = () => {
  // Local state for interactive prototype
  const [orders, setOrders] = useState<KitchenOrder[]>(initialKitchenOrders);
  const [deliveries, setDeliveries] = useState<StockDeliveryItem[]>(initialStockDeliveries);
  const [shiftState, setShiftState] = useState<KitchenShiftState>(initialShiftState);

  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<"OPEN" | "CLOSE">("OPEN");

  const [activeStatusFilter, setActiveStatusFilter] = useState<KitchenOrderStatus | "ALL">("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute live metrics dynamically from orders list
  const metrics: KitchenMetrics = useMemo(() => {
    const incoming = orders.filter((o) => o.status === "INCOMING").length;
    const preparing = orders.filter((o) => o.status === "PREPARING").length;
    const ready = orders.filter((o) => o.status === "READY").length;
    const completed = orders.filter((o) => o.status === "DELIVERED").length;
    const total = orders.length;

    return {
      incomingCount: incoming,
      preparingCount: preparing,
      readyCount: ready,
      completedTodayCount: completed,
      totalTodayCount: total,
    };
  }, [orders]);

  // Handle Order Status Transitions: INCOMING -> PREPARING -> READY -> DELIVERED
  const handleAdvanceStatus = (orderId: string, nextStatus: KitchenOrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        return {
          ...order,
          status: nextStatus,
          preparationStartedAt:
            nextStatus === "PREPARING" ? new Date().toISOString() : order.preparationStartedAt,
          readyAt: nextStatus === "READY" ? new Date().toISOString() : order.readyAt,
          deliveredAt: nextStatus === "DELIVERED" ? new Date().toISOString() : order.deliveredAt,
        };
      })
    );

    // Keep drawer in sync if open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  // Handle Order selection to open drawer
  const handleSelectOrder = (order: KitchenOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Handle Stock Acknowledging
  const handleAcknowledgeDelivery = (
    deliveryId: string,
    actualQuantity: number,
    note?: string
  ) => {
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id !== deliveryId) return del;

        const isMatch = actualQuantity === del.issuedQuantity;
        return {
          ...del,
          acknowledgedQuantity: actualQuantity,
          acknowledgedAt: new Date().toISOString(),
          acknowledgedByStaffName: `${shiftState.staffName} (Kitchen Staff)`,
          status: isMatch ? "ACKNOWLEDGED" : "DISCREPANCY",
          notes: note || del.notes,
        };
      })
    );
  };

  // Shift controls
  const handleOpenShift = (cashAmount: number) => {
    setShiftState({
      hasActiveShift: true,
      shiftId: `shf-kitchen-${Math.floor(1000 + Math.random() * 9000)}`,
      openedAt: new Date().toISOString(),
      staffName: "Chef Marco",
      department: "KITCHEN",
      openingCash: cashAmount,
    });
  };

  const handleCloseShift = (cashAmount: number) => {
    setShiftState((prev) => ({
      ...prev,
      hasActiveShift: false,
      shiftId: null,
      openedAt: null,
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Compact Shift Status Area */}
      <KitchenShiftBanner
        shiftState={shiftState}
        onOpenShiftClick={() => {
          setShiftModalMode("OPEN");
          setIsShiftModalOpen(true);
        }}
        onCloseShiftClick={() => {
          setShiftModalMode("CLOSE");
          setIsShiftModalOpen(true);
        }}
      />

      {/* 2. Dashboard Overview: 5 Summary Cards */}
      <section aria-label="Kitchen Dashboard Metrics">
        <KitchenMetricsGrid
          metrics={metrics}
          activeStatusFilter={activeStatusFilter}
          onSelectFilter={(status) => setActiveStatusFilter(status)}
        />
      </section>

      {/* 3. Kitchen Orders Management Area (4 Columns Kanban) */}
      <section aria-label="Live Kitchen Order Management" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Active Culinary Tickets & Station Prep
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Click any ticket to inspect ingredients & guest details
          </span>
        </div>

        <KitchenOrdersBoard
          orders={
            activeStatusFilter === "ALL"
              ? orders
              : orders.filter((o) => o.status === activeStatusFilter)
          }
          onSelectOrder={handleSelectOrder}
          onAdvanceStatus={handleAdvanceStatus}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </section>

      {/* 4. Stock Receiving Section */}
      <section aria-label="Kitchen Stock Receiving" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Inventory Intake & Ingredient Verification
          </h2>
        </div>

        <StockReceivingSection
          deliveries={deliveries}
          onAcknowledge={handleAcknowledgeDelivery}
        />
      </section>

      {/* 5. Order Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrder(null);
        }}
        onAdvanceStatus={handleAdvanceStatus}
      />

      {/* 6. Shift Modal */}
      <KitchenShiftModal
        shiftState={shiftState}
        isOpen={isShiftModalOpen}
        mode={shiftModalMode}
        onClose={() => setIsShiftModalOpen(false)}
        onConfirm={shiftModalMode === "OPEN" ? handleOpenShift : handleCloseShift}
      />
    </div>
  );
};
