import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import type { BarSale } from "../types";
import { formatNaira } from "../mockData";
import { BarSaleDetails } from "./BarSaleDetails";

export function BarRecentSales({ sales, loading = false }: { sales: BarSale[]; loading?: boolean }) {
  const [selected, setSelected] = useState<BarSale | null>(null);
  const [rows, setRows] = useState(sales);
  useEffect(() => setRows(sales), [sales]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => rows.filter((sale) => `${sale.reference} ${sale.saleStatus} ${sale.paymentMethod}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  return <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Recent Bar sales</CardTitle><Input aria-label="Search sales" placeholder="Search sale ID or status" value={query} onChange={(event) => setQuery(event.target.value)} className="max-w-xs" /></CardHeader><CardContent>
    <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="pb-3 pr-4 font-medium">Sale ID</th><th className="pb-3 pr-4 font-medium">Date</th><th className="pb-3 pr-4 font-medium">Items</th><th className="pb-3 pr-4 font-medium">Payment</th><th className="pb-3 pr-4 font-medium">Total</th><th className="pb-3 pr-2 font-medium">Status</th><th className="pb-3" /></tr></thead><tbody className="divide-y divide-border">{filtered.map((sale) => <tr key={sale.id}><td className="py-3 pr-4 font-medium">{sale.reference}</td><td className="py-3 pr-4 text-muted-foreground">{new Date(sale.createdAt).toLocaleString()}</td><td className="py-3 pr-4">{sale.items.reduce((n, item) => n + item.quantity, 0)} items</td><td className="py-3 pr-4 capitalize">{sale.paymentMethod.replaceAll("_", " ")}</td><td className="py-3 pr-4 font-medium">{formatNaira(sale.totalAmount)}</td><td className="py-3 pr-2 capitalize">{sale.saleStatus.replaceAll("_", " ")}</td><td className="py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setSelected(sale)}>Details</Button></td></tr>)}{!loading && filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No Bar sales found.</td></tr>}</tbody></table></div>
    {loading && <p role="status" className="py-6 text-center text-sm text-muted-foreground">Loading sales…</p>}
    <BarSaleDetails sale={selected} onClose={() => setSelected(null)} onSaleUpdated={(updated) => { setSelected(updated); setRows((current) => current.map((row) => row.id === updated.id ? updated : row)); }} />
  </CardContent></Card>;
}
