import React from "react";
import { MetricCard } from "./MetricCard";
import {
  Clock,
  Flame,
  CheckCircle2,
  PackageCheck,
  UtensilsCrossed,
} from "lucide-react";
import type { KitchenMetrics, KitchenOrderStatus } from "../types";

export interface KitchenMetricsGridProps {
  metrics: KitchenMetrics;
  activeStatusFilter?: KitchenOrderStatus | "ALL";
  onSelectFilter?: (status: KitchenOrderStatus | "ALL") => void;
}

export const KitchenMetricsGrid: React.FC<KitchenMetricsGridProps> = ({
  metrics,
  activeStatusFilter = "ALL",
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Incoming Orders */}
      <MetricCard
        title="Incoming Orders"
        count={metrics.incomingCount}
        label="pending"
        icon={<Clock className="size-5 animate-pulse" />}
        variant="warning"
        trendText="Awaiting kitchen acceptance"
        isActiveFilter={activeStatusFilter === "INCOMING"}
        onClick={() => onSelectFilter?.(activeStatusFilter === "INCOMING" ? "ALL" : "INCOMING")}
      />

      {/* 2. Preparing Orders */}
      <MetricCard
        title="Preparing Orders"
        count={metrics.preparingCount}
        label="cooking"
        icon={<Flame className="size-5" />}
        variant="info"
        trendText="Currently in preparation"
        isActiveFilter={activeStatusFilter === "PREPARING"}
        onClick={() => onSelectFilter?.(activeStatusFilter === "PREPARING" ? "ALL" : "PREPARING")}
      />

      {/* 3. Ready Orders */}
      <MetricCard
        title="Ready Orders"
        count={metrics.readyCount}
        label="dishes"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
        trendText="Awaiting waitstaff pickup"
        isActiveFilter={activeStatusFilter === "READY"}
        onClick={() => onSelectFilter?.(activeStatusFilter === "READY" ? "ALL" : "READY")}
      />

      {/* 4. Completed Orders Today */}
      <MetricCard
        title="Completed Today"
        count={metrics.completedTodayCount}
        label="served"
        icon={<PackageCheck className="size-5" />}
        variant="muted"
        trendText="Delivered to guests"
        isActiveFilter={activeStatusFilter === "DELIVERED"}
        onClick={() => onSelectFilter?.(activeStatusFilter === "DELIVERED" ? "ALL" : "DELIVERED")}
      />

      {/* 5. Total Orders Today */}
      <div className="col-span-2 sm:col-span-1">
        <MetricCard
          title="Total Orders Today"
          count={metrics.totalTodayCount}
          label="tickets"
          icon={<UtensilsCrossed className="size-5" />}
          variant="gold"
          trendText="All day order volume"
          isActiveFilter={activeStatusFilter === "ALL"}
          onClick={() => onSelectFilter?.("ALL")}
        />
      </div>
    </div>
  );
};
