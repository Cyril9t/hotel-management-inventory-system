import React from "react";
import { cn } from "cn";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { KitchenOrderStatusBadge } from "./KitchenOrderStatusBadge";
import {
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  PackageCheck,
  Eye,
  MapPin,
  CreditCard,
  Building,
} from "lucide-react";
import type { KitchenOrder, KitchenOrderStatus } from "../types";

export interface KitchenOrderCardProps {
  order: KitchenOrder;
  onSelectOrder?: (order: KitchenOrder) => void;
  onAdvanceStatus?: (orderId: string, nextStatus: KitchenOrderStatus) => void;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  onSelectOrder,
  onAdvanceStatus,
}) => {
  const orderDate = new Date(order.createdAt);
  const minutesAgo = Math.max(
    0,
    Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60))
  );

  // Status-based action button config
  const getActionButton = () => {
    switch (order.status) {
      case "INCOMING":
        return (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStatus?.(order.id, "PREPARING");
            }}
            className="w-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 h-8 shadow-xs"
          >
            <Flame className="size-3.5" />
            Start Preparing
          </Button>
        );

      case "PREPARING":
        return (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStatus?.(order.id, "READY");
            }}
            className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 shadow-xs"
          >
            <CheckCircle2 className="size-3.5" />
            Mark Ready for Pickup
          </Button>
        );

      case "READY":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStatus?.(order.id, "DELIVERED");
            }}
            className="w-full text-xs font-semibold border-primary/50 text-primary hover:bg-primary/10 gap-1.5 h-8"
          >
            <PackageCheck className="size-3.5" />
            Mark as Delivered
          </Button>
        );

      case "DELIVERED":
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onSelectOrder?.(order);
            }}
            className="w-full text-xs text-muted-foreground hover:bg-muted/60 h-8 gap-1.5"
          >
            <Eye className="size-3.5" />
            View Ticket Details
          </Button>
        );

      default:
        return null;
    }
  };

  const isUrgent = order.status === "INCOMING" && minutesAgo >= 10;

  return (
    <Card
      onClick={() => onSelectOrder?.(order)}
      className={cn(
        "group cursor-pointer border bg-card transition-all duration-150 hover:shadow-md hover:border-primary/50 relative overflow-hidden",
        isUrgent && "ring-2 ring-destructive/60 animate-pulse border-destructive/40"
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "h-1 w-full",
          order.status === "INCOMING" && "bg-amber-500",
          order.status === "PREPARING" && "bg-blue-500",
          order.status === "READY" && "bg-emerald-500",
          order.status === "DELIVERED" && "bg-muted",
          order.status === "VOIDED" && "bg-destructive"
        )}
      />

      <CardContent className="p-3.5 space-y-3">
        {/* Ticket Header: ID + Time */}
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-foreground">
              {order.orderRef}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              #{order.id.slice(0, 6)}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              minutesAgo > 20
                ? "text-destructive font-bold"
                : "text-muted-foreground"
            )}
          >
            <Clock className="size-3" />
            <span>{minutesAgo === 0 ? "Just now" : `${minutesAgo}m ago`}</span>
          </div>
        </div>

        {/* Location / Destination tag */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            {order.roomNumber ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-navy-light/10 dark:bg-brand-navy-light/40 text-primary font-bold">
                <Building className="size-3" />
                {order.roomNumber}
              </span>
            ) : order.tableNumber ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-foreground font-bold">
                <MapPin className="size-3" />
                {order.tableNumber}
              </span>
            ) : (
              <span className="text-muted-foreground">Main Restaurant</span>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground font-medium">
            By {order.createdByStaffName}
          </span>
        </div>

        {/* Ordered Food Items List (Designed for quick glance in kitchen) */}
        <div className="space-y-1.5 rounded-lg bg-muted/40 p-2 border border-border/40">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between text-xs gap-2 leading-tight"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-primary font-mono shrink-0 px-1 py-0.2 rounded bg-primary/10">
                  {item.quantity}×
                </span>
                <span className="font-medium text-foreground line-clamp-1">
                  {item.productName}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Status summary */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CreditCard className="size-3" />
            <span className="text-[11px]">
              {order.paymentMethod === "CHARGE_TO_ROOM"
                ? "Room Charge"
                : order.paymentMethod}
            </span>
            <span
              className={cn(
                "size-1.5 rounded-full ml-0.5",
                order.paymentState === "PAID"
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              )}
            />
          </div>

          <KitchenOrderStatusBadge status={order.status} size="sm" />
        </div>

        {/* Primary Action Button */}
        <div className="pt-1">{getActionButton()}</div>
      </CardContent>
    </Card>
  );
};
