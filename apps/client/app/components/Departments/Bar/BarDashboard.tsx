import { useState } from "react";
import { CalendarClock, Wine } from "lucide-react";
import { BarOverviewCards } from "./Overview/BarOverviewCards";
import { BarProductCatalog } from "./Pos/BarProductCatalog";
import { BarCart } from "./Pos/BarCart";
import { BarRecentSales } from "./Sales/BarRecentSales";
import {
  MOCK_BAR_PRODUCTS,
  MOCK_CURRENT_SHIFT,
  MOCK_OVERVIEW_METRICS,
  MOCK_RECENT_SALES,
  formatNaira,
} from "./mockData";
import type { BarCartItem, BarProduct, PaymentMethod } from "./types";

export function BarDashboard() {
  const [cart, setCart] = useState<BarCartItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [bookingRef, setBookingRef] = useState("");
  function addProduct(product: BarProduct) {
    setCart((items) => {
      const found = items.find((item) => item.product.id === product.id);
      return found
        ? items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...items, { product, quantity: 1 }];
    });
  }
  function changeQuantity(id: string, quantity: number) {
    if (quantity < 1) {
      setCart((items) => items.filter((item) => item.product.id !== id));
      return;
    }
    setCart((items) =>
      items.map((item) =>
        item.product.id === id ? { ...item, quantity } : item,
      ),
    );
  }
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-xl bg-primary/10 p-3 text-primary">
            <Wine className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Bar Operations
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Bar Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create sales and review today’s bar activity.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="rounded-full bg-brand-success/10 px-3 py-1 font-medium text-brand-success">
            Shift {MOCK_CURRENT_SHIFT.status.toLowerCase()}
          </span>
        </div>
      </header>
      <BarOverviewCards
        metrics={MOCK_OVERVIEW_METRICS}
        incomingOrders={0}
        deliveredOrders={0}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <BarProductCatalog products={MOCK_BAR_PRODUCTS} onAdd={addProduct} />
        <BarCart
          items={cart}
          onQuantity={changeQuantity}
          onRemove={(id) =>
            setCart((items) => items.filter((item) => item.product.id !== id))
          }
          payment={payment}
          onPayment={setPayment}
          bookingRef={bookingRef}
          onBookingRef={setBookingRef}
        />
      </div>
    </div>
  );
}
