import { useEffect, useState } from "react";
import { api } from "~/lib/api";
import { getBarSales, type BarSaleRecord } from "~/services/bar";
import type { BarSale } from "~/components/Departments/Bar/types";
import { BarRecentSales } from "~/components/Departments/Bar/Sales/BarRecentSales";

function mapSale(sale: BarSaleRecord): BarSale {
  const items = Array.isArray(sale.items) ? sale.items : [];
  return { id: sale.id, reference: sale.id, createdAt: sale.createdAt, items: items.map((item) => ({ id: item.id, productId: item.productId, name: item.product?.name ?? item.productId, quantity: item.quantity, unitPrice: Number(item.unitPriceAtSale), totalPrice: Number(item.lineTotal) })), subtotal: Number(sale.totalAmount), tax: 0, totalAmount: Number(sale.totalAmount), paymentMethod: ({ CASH: "cash", TRANSFER: "bank_transfer", CARD: "card", CHARGE_TO_ROOM: "charge_to_room" } as const)[sale.paymentMethod], paymentStatus: sale.paymentState === "PAID" ? "paid" : "pending", saleStatus: ({ COMPLETED: "completed", VOID_REQUESTED: "pending_void", VOIDED: "voided" } as const)[sale.status], staffName: sale.createdByUserId, bookingRef: sale.chargeToRoomBookingId ?? undefined, voidReason: sale.voidReason ?? undefined };
}
export default function Sale() {
  const [sales, setSales] = useState<BarSale[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; void getBarSales(api).then((rows) => { if (active) setSales(rows.map(mapSale)); }).catch((e: any) => { if (active) setError(e?.response?.data?.error?.message ?? e?.message ?? "Could not load Bar sales."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <div className="mx-auto w-full max-w-[1600px] space-y-4"><div><h1 className="text-2xl font-bold tracking-tight">Bar sales</h1><p className="mt-1 text-sm text-muted-foreground">Review recorded Bar transactions and sale details.</p></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<BarRecentSales sales={sales} loading={loading} /></div>;
}
