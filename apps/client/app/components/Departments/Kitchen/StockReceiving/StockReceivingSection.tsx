import React, { useState } from "react";
import { DiscrepancyBadge } from "./DiscrepancyBadge";
import { AcknowledgeDeliveryModal } from "./AcknowledgeDeliveryModal";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import {
  Package,
  PackageCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Boxes,
  Truck,
  ArrowDownLeft,
} from "lucide-react";
import type { StockDeliveryItem } from "../types";

export interface StockReceivingSectionProps {
  deliveries: StockDeliveryItem[];
  onAcknowledge?: (deliveryId: string, actualQuantity: number, note?: string) => void;
}

export const StockReceivingSection: React.FC<StockReceivingSectionProps> = ({
  deliveries,
  onAcknowledge,
}) => {
  const [selectedItem, setSelectedItem] = useState<StockDeliveryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPending, setFilterPending] = useState(false);

  const displayedDeliveries = filterPending
    ? deliveries.filter((d) => d.status === "PENDING_VERIFICATION")
    : deliveries;

  const pendingCount = deliveries.filter((d) => d.status === "PENDING_VERIFICATION").length;
  const discrepancyCount = deliveries.filter((d) => d.status === "DISCREPANCY").length;

  const handleOpenModal = (item: StockDeliveryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="p-4 sm:p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Kitchen Stock Deliveries & Intake
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Verify incoming ingredients issued from the Store before crediting Kitchen inventory.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingCount} Pending Verification
              </span>
            )}

            {discrepancyCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/15 text-destructive">
                <AlertTriangle className="size-3" />
                {discrepancyCount} Discrepancy Logged
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Responsive Table / Card Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
              <tr>
                <th className="py-3 px-4">Ingredient / Product</th>
                <th className="py-3 px-3 text-center">Issued Qty</th>
                <th className="py-3 px-3 text-center">Actual Received</th>
                <th className="py-3 px-3 text-center">Verification Status</th>
                <th className="py-3 px-4 text-right">Intake Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {displayedDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No stock deliveries matching criteria.
                  </td>
                </tr>
              ) : (
                displayedDeliveries.map((delivery) => {
                  const isPending = delivery.status === "PENDING_VERIFICATION";

                  return (
                    <tr
                      key={delivery.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      {/* Product Name & Source */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            <Boxes className="size-3.5 text-primary shrink-0" />
                            {delivery.productName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>From: {delivery.fromDepartment}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(delivery.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {delivery.notes && (
                            <p className="text-[11px] text-muted-foreground/80 italic">
                              "{delivery.notes}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Issued Quantity */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {delivery.issuedQuantity}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            {delivery.unit}
                          </span>
                        </span>
                      </td>

                      {/* Actual Received Quantity */}
                      <td className="py-3 px-3 text-center">
                        {delivery.acknowledgedQuantity !== null ? (
                          <span className="font-mono text-sm font-bold text-foreground">
                            {delivery.acknowledgedQuantity}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              {delivery.unit}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">
                            Unconfirmed
                          </span>
                        )}
                      </td>

                      {/* Discrepancy & Verification Badge */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <DiscrepancyBadge
                            issuedQuantity={delivery.issuedQuantity}
                            acknowledgedQuantity={delivery.acknowledgedQuantity}
                            unit={delivery.unit}
                          />
                          {delivery.acknowledgedByStaffName && (
                            <span className="text-[10px] text-muted-foreground">
                              By {delivery.acknowledgedByStaffName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <Button
                            size="sm"
                            onClick={() => handleOpenModal(delivery)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-xs"
                          >
                            <PackageCheck className="size-3.5" />
                            Acknowledge Delivery
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(delivery)}
                            className="text-xs h-8 gap-1 border-border text-muted-foreground hover:text-foreground"
                          >
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                            View Verification
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Modal Dialog */}
      <AcknowledgeDeliveryModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(deliveryId, actualQty, note) => {
          onAcknowledge?.(deliveryId, actualQty, note);
        }}
      />
    </Card>
  );
};
