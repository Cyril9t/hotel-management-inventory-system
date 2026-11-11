import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { BarSale } from "../types";
import { formatNaira } from "../mockData";

export function BarSaleDetails({ sale, onClose }: { sale: BarSale | null; onClose: () => void }) {
  const [requested, setRequested] = useState(false);
  return <Dialog open={Boolean(sale)} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
    {sale && <><DialogHeader><DialogTitle>Sale {sale.reference}</DialogTitle><DialogDescription>{new Date(sale.createdAt).toLocaleString()} · {sale.staffName}</DialogDescription></DialogHeader>
      <div className="space-y-4"><div className="divide-y divide-border rounded-lg border border-border">{sale.items.map((item) => <div key={item.id} className="flex justify-between gap-3 p-3 text-sm"><span>{item.quantity} × {item.name}</span><span className="font-medium">{formatNaira(item.totalPrice)}</span></div>)}</div>
        <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{sale.paymentMethod.replaceAll("_", " ")}</span></div>{sale.bookingRef && <div className="flex justify-between"><span className="text-muted-foreground">Booking reference</span><span>{sale.bookingRef}</span></div>}<div className="flex justify-between border-t border-border pt-3 font-semibold"><span>Total</span><span>{formatNaira(sale.totalAmount)}</span></div></div>
        <div className="rounded-lg border border-border bg-muted/40 p-3"><p className="text-sm font-medium">Need to void this sale?</p><p className="mt-1 text-xs text-muted-foreground">You can request a void for review. General Manager approval is required before a sale can be voided.</p>{requested ? <p role="status" className="mt-3 text-sm font-medium text-brand-success">Void request noted. General Manager approval is required.</p> : <Button className="mt-3" variant="outline" size="sm" disabled={sale.saleStatus !== "completed"} onClick={() => setRequested(true)}>Request void</Button>}</div>
      </div></>}
  </DialogContent></Dialog>;
}
