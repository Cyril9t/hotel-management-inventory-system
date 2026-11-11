import React from 'react';
import { TrendingUp, PackageOpen, CheckCircle2, BedDouble, ArrowUpRight, Inbox, PackageCheck } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '~/components/ui/card';
import { formatNaira } from '../mockData';
import type { BarOverviewMetrics } from '../types';

interface BarOverviewCardsProps {
  metrics: BarOverviewMetrics;
  incomingOrders: number;
  deliveredOrders: number;
}

export const BarOverviewCards: React.FC<BarOverviewCardsProps> = ({ metrics, incomingOrders, deliveredOrders }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <Link to="/bar/dashboard/orders" aria-label={`Incoming Orders: ${incomingOrders}. View incoming orders`} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="h-full border border-border/80 bg-card shadow-sm transition-all hover:border-primary"><CardContent className="flex h-full flex-col justify-between p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Incoming Orders</span><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Inbox className="h-4 w-4"/></div></div><div className="mt-3"><div className="text-2xl font-bold tracking-tight text-foreground">{incomingOrders}</div><p className="mt-1 text-xs text-muted-foreground">Pending delivery to the Bar</p></div></CardContent></Card></Link>

      <Link to="/bar/dashboard/orders" aria-label={`Delivered Orders: ${deliveredOrders}. View incoming orders`} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="h-full border border-border/80 bg-card shadow-sm transition-all hover:border-primary"><CardContent className="flex h-full flex-col justify-between p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivered Orders</span><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-success/10 text-brand-success"><PackageCheck className="h-4 w-4"/></div></div><div className="mt-3"><div className="text-2xl font-bold tracking-tight text-foreground">{deliveredOrders}</div><p className="mt-1 text-xs text-muted-foreground">Received by the Bar</p></div></CardContent></Card></Link>

      {/* Total Stock */}
      <Card className="border border-border/80 bg-card shadow-sm hover:border-border transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Stock
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PackageOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.totalStock.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Items currently in the bar inventory
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
