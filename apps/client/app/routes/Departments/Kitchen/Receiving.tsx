import React, { useState } from "react";
import { StockReceivingSection } from "~/components/Departments/Kitchen/StockReceiving/StockReceivingSection";
import { initialStockDeliveries } from "~/components/Departments/Kitchen/mockData";
import type { StockDeliveryItem } from "~/components/Departments/Kitchen/types";

export default function KitchenReceivingPage() {
  const [deliveries, setDeliveries] = useState<StockDeliveryItem[]>(initialStockDeliveries);

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
          acknowledgedByStaffName: "Chef Marco (Kitchen Staff)",
          status: isMatch ? "ACKNOWLEDGED" : "DISCREPANCY",
          notes: note || del.notes,
        };
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Stock Receiving & Ingredient Intake
        </h1>
        <p className="text-xs text-muted-foreground">
          Confirm physical shipments issued from the Store to credit Kitchen balance.
        </p>
      </div>

      <StockReceivingSection
        deliveries={deliveries}
        onAcknowledge={handleAcknowledgeDelivery}
      />
    </div>
  );
}
