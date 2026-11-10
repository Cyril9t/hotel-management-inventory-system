import React from "react";
import { cn } from "cn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { KitchenOrderStatusBadge } from "../Orders/KitchenOrderStatusBadge";
import {
  Clock,
  Building,
  MapPin,
  CreditCard,
  User,
  Hash,
  Flame,
  CheckCircle2,
  PackageCheck,
  Receipt,
  UtensilsCrossed,
  Info,
} from "lucide-react";
import type { KitchenOrder, KitchenOrderStatus } from "../types";

export interface OrderDetailsDrawerProps {
  order: KitchenOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStatus?: (orderId: string, nextStatus: KitchenOrderStatus) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onAdvanceStatus,
}) => {
  if (!order) return null;

  const orderDate = new Date(order.createdAt);
  const formattedTime = orderDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const formattedDate = orderDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0 flex flex-col gap-0 border-l border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="p-5 border-b border-border bg-muted/20 space-y-2">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold tracking-tight text-foreground">
                {order.orderRef}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                #{order.id.slice(0, 8)}
              </span>
            </div>
            <KitchenOrderStatusBadge status={order.status} />
          </div>

          <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-muted-foreground" />
              {formattedDate} at {formattedTime}
            </span>
            <span>•</span>
            <span>Destination: {order.destination}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Drawer Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Quick Context Card (Table / Room / Waitstaff) */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Serving Location
              </span>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                {order.roomNumber ? (
                  <>
                    <Building className="size-4 text-primary" />
                    {order.roomNumber} (Hotel Guest)
                  </>
                ) : order.tableNumber ? (
                  <>
                    <MapPin className="size-4 text-primary" />
                    {order.tableNumber} (Restaurant Dine-in)
                  </>
                ) : (
                  "Restaurant Counter"
                )}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Service Waiter
              </span>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <User className="size-4 text-muted-foreground" />
                {order.createdByStaffName}
              </p>
            </div>
          </div>

          {/* Ordered Food Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <UtensilsCrossed className="size-3.5" />
                Ordered Dishes & Portions
              </h4>
              <span className="text-xs font-medium text-muted-foreground">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} total portions
              </span>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-semibold">Dish / Product</th>
                    <th className="py-2.5 px-3 text-center font-semibold w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Unit Price</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground text-sm">
                          {item.productName}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          ID: {item.productId.slice(0, 8)}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex size-6 items-center justify-center font-bold text-primary font-mono rounded bg-primary/15">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        ₦ {item.unitPriceAtOrder.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                        ₦ {item.lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Summary & Payment Status */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Receipt className="size-3.5" />
              Bill & Payment Reconciliation
            </h4>

            <div className="space-y-2 text-xs divide-y divide-border/40">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-muted-foreground">Gross Ticket Amount</span>
                <span className="font-mono font-bold text-foreground text-sm">
                  ₦ {order.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Settlement Method</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-primary" />
                  {order.paymentMethod === "CHARGE_TO_ROOM"
                    ? "Charge to Guest Folio"
                    : order.paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Payment Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                      order.paymentState === "PAID"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        order.paymentState === "PAID" ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                    {order.paymentState === "PAID" ? "Settled / Paid" : "Unpaid / Pending Folio"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 text-[11px] text-muted-foreground flex items-start gap-2 border border-border/60">
              <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                Payment collection is verified by Restaurant & Front Desk. The kitchen is strictly responsible for culinary prep and station dispatch.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-border bg-muted/20 gap-2 flex-row sm:justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Drawer
          </Button>

          {order.status === "INCOMING" && (
            <Button
              size="sm"
              onClick={() => {
                onAdvanceStatus?.(order.id, "PREPARING");
                onClose();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1.5 font-semibold"
            >
              <Flame className="size-3.5" />
              Accept & Start Preparing
            </Button>
          )}

          {order.status === "PREPARING" && (
            <Button
              size="sm"
              onClick={() => {
                onAdvanceStatus?.(order.id, "READY");
                onClose();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold"
            >
              <CheckCircle2 className="size-3.5" />
              Mark Ready for Pickup
            </Button>
          )}

          {order.status === "READY" && (
            <Button
              size="sm"
              onClick={() => {
                onAdvanceStatus?.(order.id, "DELIVERED");
                onClose();
              }}
              className="bg-primary text-primary-foreground text-xs gap-1.5 font-semibold"
            >
              <PackageCheck className="size-3.5" />
              Mark Delivered
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
