import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import type { BarIncomingOrder } from "../types";
import { formatNaira } from "../mockData";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function IncomingOrderDetails({ order, onClose, onMarkDelivered }: { order: BarIncomingOrder | null; onClose: () => void; onMarkDelivered: (id: string) => void }) {
  return <Dialog open={Boolean(order)} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
    {order && <><DialogHeader><DialogTitle>Order {order.reference}</DialogTitle><DialogDescription>Order details and delivery status.</DialogDescription></DialogHeader>
      <div className="space-y-4"><dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-muted-foreground">Order source</dt><dd className="mt-1 font-medium">{order.source}</dd></div><div><dt className="text-muted-foreground">Date &amp; time</dt><dd className="mt-1 font-medium">{new Date(order.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</dd></div><div><dt className="text-muted-foreground">Delivery status</dt><dd className="mt-1"><OrderStatusBadge status={order.status}/></dd></div></dl>
        <Separator/><div><h3 className="mb-2 text-sm font-semibold">Items ordered</h3><div className="divide-y divide-border rounded-lg border border-border">{order.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 p-3 text-sm"><div className="min-w-0"><p className="font-medium">{item.name}</p><p className="mt-0.5 text-xs text-muted-foreground">Qty {item.quantity} × {formatNaira(item.unitPrice)}</p></div><span className="shrink-0 font-medium">{formatNaira(item.quantity * item.unitPrice)}</span></div>)}</div></div>
        <div className="flex justify-between border-t border-border pt-3 font-semibold"><span>Total amount</span><span>{formatNaira(order.totalAmount)}</span></div>
      </div>
      <DialogFooter>{order.status === "Pending" ? <Button onClick={() => { onMarkDelivered(order.id); onClose(); }}>Mark as Delivered</Button> : <Button disabled>Already Delivered</Button>}</DialogFooter>
    </>}
  </DialogContent></Dialog>;
}
