import { Card, CardContent } from "~/components/ui/card";
import type { BarIncomingOrder, BarIncomingOrderStatus } from "../types";

type Filter = "All Orders" | BarIncomingOrderStatus;
export function IncomingOrderSummary({ orders, selected, onSelect }: { orders: BarIncomingOrder[]; selected: Filter; onSelect: (filter: Filter) => void }) {
  const summaries: { label: Filter; value: number; hint: string }[] = [
    { label: "All Orders", value: orders.length, hint: "Orders received by the Bar" },
    { label: "Pending", value: orders.filter((order) => order.status === "Pending").length, hint: "Awaiting delivery" },
    { label: "Delivered", value: orders.filter((order) => order.status === "Delivered").length, hint: "Received by the Bar" },
  ];
  return <section aria-label="Order summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3">{summaries.map((item) => <button key={item.label} type="button" onClick={() => onSelect(item.label)} aria-pressed={selected === item.label} className="rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className={`h-full border transition-colors ${selected === item.label ? "border-primary" : "border-border/80"}`}><CardContent className="p-4"><p className="text-sm font-medium text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.hint}</p></CardContent></Card></button>)}</section>;
}
