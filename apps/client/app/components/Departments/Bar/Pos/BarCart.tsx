import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { BarCartItem, PaymentMethod } from "../types";
import { formatNaira } from "../mockData";

const payments: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Cash" }, { id: "bank_transfer", label: "Bank Transfer" }, { id: "card", label: "Card" }, { id: "charge_to_room", label: "Charge to Room" },
];

export function BarCart({ items, onQuantity, onRemove, payment, onPayment, bookingRef, onBookingRef }: {
  items: BarCartItem[]; onQuantity: (id: string, quantity: number) => void; onRemove: (id: string) => void;
  payment: PaymentMethod; onPayment: (payment: PaymentMethod) => void; bookingRef: string; onBookingRef: (ref: string) => void;
}) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <Card className="lg:sticky lg:top-4">
    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ShoppingBag className="h-4 w-4 text-primary"/>Current sale <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">{items.reduce((n, item) => n + item.quantity, 0)}</span></CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="max-h-72 space-y-3 overflow-y-auto">{items.length ? items.map(({ product, quantity }) => <div key={product.id} className="flex gap-3 border-b border-border pb-3 last:border-0">
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatNaira(product.price)} each</p><div className="mt-2 flex items-center gap-1"><Button size="icon-sm" variant="outline" aria-label={`Decrease ${product.name}`} onClick={() => onQuantity(product.id, quantity - 1)}><Minus/></Button><span className="w-8 text-center text-sm">{quantity}</span><Button size="icon-sm" variant="outline" aria-label={`Increase ${product.name}`} onClick={() => onQuantity(product.id, quantity + 1)}><Plus/></Button><Button size="icon-sm" variant="ghost" className="ml-auto text-destructive" aria-label={`Remove ${product.name}`} onClick={() => onRemove(product.id)}><Trash2/></Button></div></div>
        <span className="shrink-0 text-sm font-medium">{formatNaira(product.price * quantity)}</span>
      </div>) : <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">Your sale is empty. Add items from the menu.</div>}</div>
      <div className="space-y-2 border-t border-border pt-3 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatNaira(total)}</span></div><div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatNaira(total)}</span></div></div>
      <fieldset className="space-y-2"><legend className="text-sm font-medium">Payment method</legend><div className="grid grid-cols-2 gap-2">{payments.map((option) => <Button type="button" key={option.id} size="sm" variant={payment === option.id ? "secondary" : "outline"} className="h-auto min-h-9 whitespace-normal" onClick={() => onPayment(option.id)}>{option.label}</Button>)}</div></fieldset>
      {payment === "charge_to_room" && <div className="space-y-1.5"><Label htmlFor="bar-booking-ref">Booking reference</Label><Input id="bar-booking-ref" placeholder="e.g. BK-78401" value={bookingRef} onChange={(event) => onBookingRef(event.target.value)}/></div>}
      <Button className="w-full" disabled={!items.length}>Complete sale <span className="ml-auto">{formatNaira(total)}</span></Button>
      <p className="text-center text-xs text-muted-foreground">UI preview only. Sales are not submitted.</p>
    </CardContent>
  </Card>;
}
