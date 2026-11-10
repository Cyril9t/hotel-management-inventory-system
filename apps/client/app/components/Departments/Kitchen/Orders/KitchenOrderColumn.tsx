import React from "react";
import { cn } from "cn";
import { KitchenOrderCard } from "./KitchenOrderCard";
import type { KitchenOrder, KitchenOrderStatus } from "../types";

export interface KitchenOrderColumnProps {
  status: KitchenOrderStatus;
  title: string;
  icon: React.ReactNode;
  orders: KitchenOrder[];
  variant?: "warning" | "info" | "success" | "muted";
  onSelectOrder?: (order: KitchenOrder) => void;
  onAdvanceStatus?: (orderId: string, nextStatus: KitchenOrderStatus) => void;
}

const columnVariants: Record<
  NonNullable<KitchenOrderColumnProps["variant"]>,
  {
    headerBg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  warning: {
    headerBg: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
    border: "border-amber-500/30",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-800 dark:text-amber-300",
  },
  info: {
    headerBg: "bg-blue-500/10 text-blue-800 dark:text-blue-300",
    border: "border-blue-500/30",
    badgeBg: "bg-blue-500/20",
    badgeText: "text-blue-800 dark:text-blue-300",
  },
  success: {
    headerBg: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-800 dark:text-emerald-300",
  },
  muted: {
    headerBg: "bg-muted text-muted-foreground",
    border: "border-border",
    badgeBg: "bg-card",
    badgeText: "text-foreground",
  },
};

export const KitchenOrderColumn: React.FC<KitchenOrderColumnProps> = ({
  status,
  title,
  icon,
  orders,
  variant = "muted",
  onSelectOrder,
  onAdvanceStatus,
}) => {
  const styles = columnVariants[variant];

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/60 dark:bg-card/40 overflow-hidden shadow-xs min-w-[280px] flex-1">
      {/* Column Header */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between border-b transition-colors",
          styles.headerBg,
          styles.border
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
        </div>

        <span
          className={cn(
            "size-6 rounded-full flex items-center justify-center font-bold text-xs shadow-xs font-mono",
            styles.badgeBg,
            styles.badgeText
          )}
        >
          {orders.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[380px] flex-1">
        {orders.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-lg border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
            <p className="text-xs font-medium">No {title.toLowerCase()} tickets</p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Station is all caught up
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onSelectOrder={onSelectOrder}
              onAdvanceStatus={onAdvanceStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};
