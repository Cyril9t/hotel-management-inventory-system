import React from 'react';
import { TrendingUp, Banknote, CheckCircle2, BedDouble, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import { formatNaira } from '../mockData';
import type { BarOverviewMetrics } from '../types';

interface BarOverviewCardsProps {
  metrics: BarOverviewMetrics;
}

export const BarOverviewCards: React.FC<BarOverviewCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Sales */}
      <Card className="border border-border/80 bg-card shadow-sm hover:border-border transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Sales
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatNaira(metrics.todaySales)}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-brand-success font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 inline" />
              <span>+{metrics.salesGrowthPercent}% vs yesterday</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Bar Revenue */}
      <Card className="border border-border/80 bg-card shadow-sm hover:border-border transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Bar Revenue
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatNaira(metrics.totalRevenue)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cumulative monthly bar turnover
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Completed Sales */}
      <Card className="border border-border/80 bg-card shadow-sm hover:border-border transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Sales
            </span>
            <div className="h-8 w-8 rounded-lg bg-brand-success/10 text-brand-success flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.completedSales}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Fulfilled drink & snack orders today
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Room Charges */}
      <Card className="border border-border/80 bg-card shadow-sm hover:border-border transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Outstanding Room Charges
            </span>
            <div className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatNaira(metrics.outstandingRoomCharges)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.pendingRoomChargesCount} guest folios awaiting reception checkout
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
