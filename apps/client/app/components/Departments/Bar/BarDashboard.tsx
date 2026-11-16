import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarClock, Wine } from "lucide-react";
import { api } from "~/lib/api";
import { useShift } from "~/Context/ShiftContext";
import { BarOverviewCards } from "./Overview/BarOverviewCards";
import { BarProductCatalog } from "./Pos/BarProductCatalog";
import { BarCart } from "./Pos/BarCart";
import { BarRecentSales } from "./Sales/BarRecentSales";
import { createBarSale, getBarProducts, getBarSales, type BarSaleRecord } from "~/services/bar";
import type { BarCartItem, BarProduct, PaymentMethod } from "./types";

const paymentMethods: Record<PaymentMethod, BarSaleRecord["paymentMethod"]> = { cash: "CASH", bank_transfer: "TRANSFER", card: "CARD", charge_to_room: "CHARGE_TO_ROOM" };
function asSale(sale: BarSaleRecord) {
  const items = Array.isArray(sale.items) ? sale.items : [];
  return { id: sale.id, reference: sale.id, createdAt: sale.createdAt, items: items.map((item) => ({ id: item.id, productId: item.productId, name: item.product?.name ?? item.productId, quantity: item.quantity, unitPrice: Number(item.unitPriceAtSale), totalPrice: Number(item.lineTotal) })), subtotal: Number(sale.totalAmount), tax: 0, totalAmount: Number(sale.totalAmount), paymentMethod: ({ CASH: "cash", TRANSFER: "bank_transfer", CARD: "card", CHARGE_TO_ROOM: "charge_to_room" } as const)[sale.paymentMethod], paymentStatus: sale.paymentState === "PAID" ? "paid" : "pending", saleStatus: ({ COMPLETED: "completed", VOID_REQUESTED: "pending_void", VOIDED: "voided" } as const)[sale.status], staffName: sale.createdByUserId, bookingRef: sale.chargeToRoomBookingId ?? undefined, voidReason: sale.voidReason ?? undefined } as const;
}

export function BarDashboard() {
  const { currentShift, refreshCurrentShift } = useShift();
  const [cart, setCart] = useState<BarCartItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [bookingRef, setBookingRef] = useState("");
  const [products, setProducts] = useState<BarProduct[]>([]);
  const [sales, setSales] = useState<BarSaleRecord[]>([]);
  const [todaySummary, setTodaySummary] = useState<{ revenue: number; salesCount: number } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const submitLock = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(null);
    Promise.all([getBarProducts(api), getBarSales(api)])
      .then(([productRows, saleRows]) => {
        if (!active) return;
        setProducts(productRows.map((p) => ({ id: p.id, name: p.name, price: Number(p.unitPrice), category: undefined, unit: "unit" })));
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
        const completedToday = saleRows.filter((sale) => {
          const created = Date.parse(sale.createdAt);
          return sale.status === "COMPLETED" && created >= startOfToday && created < startOfTomorrow;
        });
        const revenue = completedToday.reduce((sum, sale) => {
          const amount = Number(sale.totalAmount);
          if (!Number.isFinite(amount) || amount < 0) throw new Error("A Bar sale returned an invalid total.");
          return sum + amount;
        }, 0);
        setSales(saleRows); setTodaySummary({ revenue, salesCount: completedToday.length });
      }).catch((error: any) => { if (active) setLoadError(error?.response?.data?.error?.message ?? error?.message ?? "Could not load Bar dashboard data."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  const addProduct = (product: BarProduct) => setCart((items) => {
    const found = items.find((item) => item.product.id === product.id);
    return found ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }];
  });
  const changeQuantity = (id: string, quantity: number) => setCart((items) => quantity < 1 ? items.filter((item) => item.product.id !== id) : items.map((item) => item.product.id === id ? { ...item, quantity } : item));
  const submitSale = useCallback(async () => {
    if (submitLock.current || cart.length === 0) return;
    submitLock.current = true;
    setSubmitting(true); setSaleError(null);
    try {
      await createBarSale(api, cart.map(({ product, quantity }) => ({ productId: product.id, quantity })), paymentMethods[payment], bookingRef.trim() || undefined);
      // POST returns the sale summary; GET /orders/sales provides its item list for display.
      // Do not insert the POST shape into the list before the GET refresh completes.
      setCart([]); setBookingRef(""); setRefreshKey((key) => key + 1); void refreshCurrentShift();
    } catch (error: any) { setSaleError(error?.response?.data?.error?.message ?? error?.message ?? "Sale could not be completed."); }
    finally { submitLock.current = false; setSubmitting(false); }
  }, [submitting, cart, payment, bookingRef, refreshCurrentShift]);

  const productsForUi = products;
  const saleCards = sales.slice(0, 5).map(asSale);
  return <div className="mx-auto w-full max-w-[1600px] space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-start gap-3"><span className="mt-1 rounded-xl bg-primary/10 p-3 text-primary"><Wine className="h-6 w-6" /></span><div><p className="text-sm font-medium text-muted-foreground">Bar Operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Bar Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Create sales and review today’s bar activity.</p></div></div><div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" />{new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</span><span className="rounded-full bg-secondary px-3 py-1 font-medium">Shift {currentShift?.department === "BAR" ? currentShift.status?.toLowerCase() ?? "open" : "not verified"}</span></div></header>
    {loadError && <div role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{loadError} <button className="underline" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button></div>}
    <BarOverviewCards metrics={todaySummary ? { todaySales: todaySummary.revenue, completedSales: todaySummary.salesCount } : null} loading={loading} />
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div>{loading ? <p role="status" className="p-6 text-sm text-muted-foreground">Loading Bar products…</p> : <BarProductCatalog products={productsForUi} onAdd={addProduct} />}</div><BarCart items={cart} onQuantity={changeQuantity} onRemove={(id) => setCart((items) => items.filter((item) => item.product.id !== id))} payment={payment} onPayment={setPayment} bookingRef={bookingRef} onBookingRef={setBookingRef} onSubmit={() => void submitSale()} submitting={submitting} error={saleError} /></div>
    <BarRecentSales sales={saleCards} loading={loading} />
  </div>;
}
