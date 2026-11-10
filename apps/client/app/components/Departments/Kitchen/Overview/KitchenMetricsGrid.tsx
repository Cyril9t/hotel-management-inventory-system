import React from "react";
import { MetricCard } from "./MetricCard";
import {
  Clock,
  Flame,
  CheckCircle2,
  PackageCheck,
  UtensilsCrossed,
} from "lucide-react";
import type { KitchenMetrics } from "../types";

export interface KitchenMetricsGridProps {
  metrics: KitchenMetrics;
}

export const KitchenMetricsGrid: React.FC<KitchenMetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Incoming Orders */}
      <MetricCard
        title="Incoming Orders"
        count={metrics.incomingCount}
        label="pending"
        icon={<Clock className="size-5 animate-pulse" />}
        variant="warning"
        trendText="Awaiting kitchen preparation"
      />

      {/* 2. Preparing Orders */}
      <MetricCard
        title="Preparing Orders"
        count={metrics.preparingCount}
        label="cooking"
        icon={<Flame className="size-5" />}
        variant="info"
        trendText="Currently being prepared"
      />

      {/* 3. Ready Orders */}
      <MetricCard
        title="Ready Orders"
        count={metrics.readyCount}
        label="dishes"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
        trendText="Waiting for pickup"
      />

      {/* 4. Completed Orders Today */}
      <MetricCard
        title="Completed Orders Today"
        count={metrics.completedTodayCount}
        label="orders"
        icon={<PackageCheck className="size-5" />}
        variant="muted"
        trendText={metrics.completedTodayCount === null ? "Completion time is not provided by the API" : "Delivered today"}
      />

      {/* 5. Total Orders Today */}
      <div>
        <MetricCard
          title="Total Orders Today"
          count={metrics.totalTodayCount}
          label="tickets"
          icon={<UtensilsCrossed className="size-5" />}
          variant="gold"
          trendText="All day order volume"
        />
      </div>
    </div>
  );
};
