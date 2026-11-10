import React from "react";
import { cn } from "cn";
import { Card, CardContent } from "~/components/ui/card";

export interface MetricCardProps {
  title: string;
  count: number | string | null;
  label?: string;
  icon: React.ReactNode;
  variant?: "warning" | "info" | "success" | "muted" | "gold";
  trendText?: string;
  isActiveFilter?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<
  NonNullable<MetricCardProps["variant"]>,
  {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    badge: string;
  }
> = {
  warning: {
    bg: "bg-brand-warning/5",
    border: "border-brand-warning/30",
    iconBg: "bg-brand-warning/10 text-brand-warning",
    iconColor: "text-brand-warning",
    badge: "bg-brand-warning/10 text-brand-warning",
  },
  info: {
    bg: "bg-primary/5",
    border: "border-primary/30",
    iconBg: "bg-primary/10 text-primary",
    iconColor: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
  success: {
    bg: "bg-brand-success/5",
    border: "border-brand-success/30",
    iconBg: "bg-brand-success/10 text-brand-success",
    iconColor: "text-brand-success",
    badge: "bg-brand-success/10 text-brand-success",
  },
  muted: {
    bg: "bg-muted/40",
    border: "border-border",
    iconBg: "bg-muted text-muted-foreground",
    iconColor: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  gold: {
    bg: "bg-primary/5 dark:bg-primary/10",
    border: "border-primary/40",
    iconBg: "bg-primary/15 text-primary",
    iconColor: "text-primary",
    badge: "bg-primary/15 text-primary font-semibold",
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  label = "orders",
  icon,
  variant = "gold",
  trendText,
  isActiveFilter = false,
  onClick,
}) => {
  const styles = variantStyles[variant];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative transition-all duration-150 border overflow-hidden",
        styles.bg,
        isActiveFilter ? "ring-2 ring-primary shadow-sm" : styles.border,
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.01]"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {count === null ? "—" : count}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {count === null ? "unavailable" : typeof count === "number" && count === 1 ? label.replace(/s$/, "") : label}
              </span>
            </div>
            {trendText && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                {trendText}
              </p>
            )}
          </div>

          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              styles.iconBg
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
