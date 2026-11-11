import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { BarSale } from "../types";
import { formatNaira } from "../mockData";
import { BarSaleDetails } from "./BarSaleDetails";

export function BarRecentSales({ sales }: { sales: BarSale[] }) {
  const [selected, setSelected] = useState<BarSale | null>(null);
  return <Card><CardHeader><CardTitle className="text-base">Recent sales</CardTitle></CardHeader><CardContent>
    <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="pb-3 pr-4 font-medium">Sale</th><th className="pb-3 pr-4 font-medium">Time</th><th className="pb-3 pr-4 font-medium">Items</th><th className="pb-3 pr-4 font-medium">Payment</th><th className="pb-3 pr-4 font-medium">Total</th><th className="pb-3 pr-2 font-medium">Status</th><th className="pb-3"/></tr></thead><tbody className="divide-y divide-border">{sales.map((sale) => <tr key={sale.id}><td className="py-3 pr-4 font-medium">{sale.reference}</td><td className="py-3 pr-4 text-muted-foreground">{new Date(sale.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td><td className="py-3 pr-4">{sale.items.reduce((n, item) => n + item.quantity, 0)} items</td><td className="py-3 pr-4 capitalize">{sale.paymentMethod.replaceAll("_", " ")}</td><td className="py-3 pr-4 font-medium">{formatNaira(sale.totalAmount)}</td><td className="py-3 pr-2"><span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">{sale.saleStatus.replaceAll("_", " ")}</span></td><td className="py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setSelected(sale)}>Details</Button></td></tr>)}</tbody></table></div>
    <BarSaleDetails sale={selected} onClose={() => setSelected(null)}/>
  </CardContent></Card>;
}
