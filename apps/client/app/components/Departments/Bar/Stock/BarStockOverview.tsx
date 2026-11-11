import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export interface BarStockItem {
  id: string;
  name: string;
  transferredIn: number;
  used: number;
  available: number;
  unit: "bottles" | "crates" | "glasses" | "cans";
}

const mockStock: BarStockItem[] = [
  { id: "heineken", name: "Heineken", transferredIn: 50, used: 22, available: 28, unit: "bottles" },
  { id: "red-wine", name: "Red Wine", transferredIn: 18, used: 9, available: 9, unit: "glasses" },
  { id: "soft-drink", name: "Soft Drink", transferredIn: 42, used: 12, available: 30, unit: "bottles" },
  { id: "guinness-crate", name: "Guinness Stout", transferredIn: 12, used: 8, available: 4, unit: "crates" },
  { id: "cola-cans", name: "Cola", transferredIn: 36, used: 14, available: 22, unit: "cans" },
];

function StockQuantity({ quantity, unit }: { quantity: number; unit: BarStockItem["unit"] }) {
  return <>{quantity.toLocaleString()} {unit}</>;
}

export function BarStockOverview({ items = mockStock }: { items?: BarStockItem[] }) {
  return <Card className="overflow-hidden">
    <CardHeader className="border-b border-border">
      <CardTitle>Bar Store Stock</CardTitle>
      <CardDescription>Transferred stock, usage, and current availability.</CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      {items.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-4">Item</th>
              <th scope="col" className="px-4 py-4">Transferred In</th>
              <th scope="col" className="px-4 py-4">Used</th>
              <th scope="col" className="px-5 py-4">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
              const lowStock = item.available <= 10;
              return <tr key={item.id} className="hover:bg-muted/20">
                <td className="px-5 py-4 font-semibold">{item.name}</td>
                <td className="px-4 py-4 text-muted-foreground"><StockQuantity quantity={item.transferredIn} unit={item.unit}/></td>
                <td className="px-4 py-4 text-muted-foreground"><StockQuantity quantity={item.used} unit={item.unit}/></td>
                <td className="px-5 py-4"><div className="flex flex-wrap items-center gap-2 font-medium"><StockQuantity quantity={item.available} unit={item.unit}/>{lowStock && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">Low stock</span>}</div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div> : <div className="p-10 text-center"><p className="font-medium">No bar stock to display</p><p className="mt-1 text-sm text-muted-foreground">Stock items will appear here when they are available.</p></div>}
    </CardContent>
  </Card>;
}
