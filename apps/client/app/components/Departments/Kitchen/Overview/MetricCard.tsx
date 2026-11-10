import React from "react";
import { cn } from "cn";
import { Card, CardContent } from "~/components/ui/card";

export interface MetricCardProps {
  title: string;
  count: number;
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
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  info: {
    bg: "bg-blue-500/5 dark:bg-blue-500/10",
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  success: {
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
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
                {count}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {count === 1 ? label.replace(/s$/, "") : label}
              </span>
            </div>
            {trendText && (
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
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
