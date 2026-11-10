import React from "react";
import { cn } from "cn";
import { Clock, Flame, CheckCircle2, PackageCheck, Ban } from "lucide-react";
import type { KitchenOrderStatus } from "~/services/kitchen";

export interface KitchenOrderStatusBadgeProps {
  status: KitchenOrderStatus;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  KitchenOrderStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  INCOMING: {
    label: "Incoming",
    bg: "bg-brand-warning/10",
    text: "text-brand-warning",
    border: "border-brand-warning/30",
    icon: Clock,
  },
  PREPARING: {
    label: "Preparing",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    icon: Flame,
  },
  READY: {
    label: "Ready for Pickup",
    bg: "bg-brand-success/10",
    text: "text-brand-success",
    border: "border-brand-success/30",
    icon: CheckCircle2,
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    icon: PackageCheck,
  },
  VOIDED: {
    label: "Cancelled / Voided",
    bg: "bg-destructive/15",
    text: "text-destructive",
    border: "border-destructive/30",
    icon: Ban,
  },
};

export const KitchenOrderStatusBadge: React.FC<KitchenOrderStatusBadgeProps> = ({
  status,
  className,
  size = "md",
}) => {
  const config = statusConfig[status] || statusConfig.INCOMING;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-md border tracking-wide uppercase",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "size-3" : "size-3.5")} />
      <span>{config.label}</span>
    </span>
  );
};
