import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
export function BarStockOverview() {
  return <Card className="overflow-hidden"><CardHeader className="border-b border-border"><CardTitle>Bar Stock Balances</CardTitle><CardDescription>The current API does not grant the Bar staff role access to department stock balances.</CardDescription></CardHeader><CardContent className="p-6 text-sm text-muted-foreground">Stock quantities, transferred amounts, usage, and availability cannot be displayed for this role. Ask a Store Manager or General Manager to review stock.</CardContent></Card>;
}
