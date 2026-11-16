import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
export function IncomingOrdersPage() {
  return <div className="mx-auto w-full max-w-[1600px] space-y-6"><header><p className="text-sm font-medium text-muted-foreground">Bar Operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Incoming Orders</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Incoming Bar orders are unavailable from the current backend API.</p></header><Card><CardHeader><CardTitle>Bar order feed unavailable</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">The API exposes Kitchen orders, which are generated for Restaurant sales. Bar sales do not create Kitchen orders, and there is no Bar incoming-orders endpoint. No order data or delivery actions are shown here.</CardContent></Card></div>;
}
export default function Orders() { return <IncomingOrdersPage />; }
