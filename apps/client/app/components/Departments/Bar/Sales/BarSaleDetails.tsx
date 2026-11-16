import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/api";
import type { BarSale } from "../types";
import { formatNaira } from "../mockData";
import { getBarSale, requestBarSaleVoid, type BarSaleRecord } from "~/services/bar";

export function BarSaleDetails({ sale, onClose, onSaleUpdated }: { sale: BarSale | null; onClose: () => void; onSaleUpdated?: (sale: BarSale) => void }) {
  const [details, setDetails] = useState<BarSaleRecord | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!sale) { setDetails(null); setReason(""); setError(""); return; }
    let active = true; setLoading(true); setError("");
    void getBarSale(api, sale.id).then((data) => { if (active) setDetails(data); }).catch((e: any) => { if (active) setError(e?.response?.data?.error?.message ?? e?.message ?? "Could not load sale details."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sale?.id]);
  async function requestVoid() {
    if (!sale || !reason.trim() || submitting) return;
    setSubmitting(true); setError("");
    try {
      const updated = await requestBarSaleVoid(api, sale.id, reason.trim()); setDetails(updated);
      onSaleUpdated?.({ ...sale, saleStatus: "pending_void", voidReason: updated.voidReason ?? reason.trim() });
    } catch (e: any) { setError(e?.response?.data?.error?.message ?? e?.message ?? "Void request failed."); }
    finally { setSubmitting(false); }
  }
  return <Dialog open={Boolean(sale)} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">{sale && <><DialogHeader><DialogTitle>Sale {sale.reference}</DialogTitle><DialogDescription>{new Date(sale.createdAt).toLocaleString()}</DialogDescription></DialogHeader>{loading ? <p role="status">Loading sale details…</p> : details ? <div className="space-y-4"><div className="divide-y divide-border rounded-lg border border-border">{details.items.map((item) => <div key={item.id} className="flex justify-between gap-3 p-3 text-sm"><span>{item.quantity} × {item.product?.name ?? item.productId}</span><span className="font-medium">{formatNaira(Number(item.lineTotal))}</span></div>)}</div><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{details.paymentMethod.replaceAll("_", " ")}</span></div>{details.chargeToRoomBookingId && <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span>{details.chargeToRoomBookingId}</span></div>}<div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{details.status}</span></div>{details.voidReason && <div><span className="text-muted-foreground">Void request reason</span><p>{details.voidReason}</p></div>}<div className="flex justify-between border-t border-border pt-3 font-semibold"><span>Total</span><span>{formatNaira(Number(details.totalAmount))}</span></div></div>{details.status === "COMPLETED" && <div className="space-y-2 rounded-lg border p-3"><p className="text-sm font-medium">Request sale void</p><Input aria-label="Void reason" placeholder="Reason for requesting a void" value={reason} onChange={(e) => setReason(e.target.value)} /><Button type="button" variant="outline" size="sm" disabled={!reason.trim() || submitting} onClick={() => void requestVoid()}>{submitting ? "Submitting…" : "Submit void request"}</Button></div>}</div> : null}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</>}</DialogContent></Dialog>;
}
