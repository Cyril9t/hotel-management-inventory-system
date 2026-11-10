import React, { useState } from "react";
import { KitchenOrdersBoard } from "~/components/Departments/Kitchen/Orders/KitchenOrdersBoard";
import { OrderDetailsDrawer } from "~/components/Departments/Kitchen/OrderDetails/OrderDetailsDrawer";
import { initialKitchenOrders } from "~/components/Departments/Kitchen/mockData";
import type { KitchenOrder, KitchenOrderStatus } from "~/components/Departments/Kitchen/types";

export default function KitchenOrdersPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialKitchenOrders);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAdvanceStatus = (orderId: string, nextStatus: KitchenOrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: nextStatus,
        };
      })
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Live Culinary Orders & Station Dispatch
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time Kanban workflow for restaurant and room service food orders.
        </p>
      </div>

      <KitchenOrdersBoard
        orders={orders}
        onSelectOrder={(order) => {
          setSelectedOrder(order);
          setIsDrawerOpen(true);
        }}
        onAdvanceStatus={handleAdvanceStatus}
      />

      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrder(null);
        }}
        onAdvanceStatus={handleAdvanceStatus}
      />
    </div>
  );
}
