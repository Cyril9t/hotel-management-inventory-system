import type { BarIncomingOrderStatus } from "../types";

export function OrderStatusBadge({ status }: { status: BarIncomingOrderStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status === "Pending" ? "bg-accent text-accent-foreground" : "bg-brand-success/10 text-brand-success"}`}>{status}</span>;
}
