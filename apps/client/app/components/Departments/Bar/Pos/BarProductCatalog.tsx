import { Search, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { BAR_CATEGORIES } from "../mockData";
import type { BarProduct, BarProductCategory } from "../types";
import { formatNaira } from "../mockData";

export function BarProductCatalog({ products, onAdd }: { products: BarProduct[]; onAdd: (product: BarProduct) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BarProductCategory>("all");
  const filtered = useMemo(() => products.filter((product) =>
    (category === "all" || product.category === category) &&
    `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase())), [products, category, query]);

  return <section className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold">Menu</h2><p className="text-sm text-muted-foreground">Select an item to add it to the sale.</p></div>
      <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Search bar products" placeholder="Search menu" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)}/></div>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Product categories">{BAR_CATEGORIES.map((item) => <Button key={item.id} size="sm" variant={category === item.id ? "default" : "outline"} className="shrink-0" onClick={() => setCategory(item.id)}>{item.label}</Button>)}</div>
    {filtered.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <Card key={product.id} className="transition-colors hover:border-primary/50"><CardContent className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2"><div><h3 className="font-medium leading-snug">{product.name}</h3><p className="mt-1 text-xs text-muted-foreground">{product.volume ?? product.unit} · {product.sku}</p></div>{product.badge && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{product.badge}</span>}</div>
      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground">{product.description}</p>
      <div className="mt-4 flex items-center justify-between gap-2"><span className="font-semibold">{formatNaira(product.price)}</span><Button size="sm" onClick={() => onAdd(product)} aria-label={`Add ${product.name}`}><Plus/>Add</Button></div>
    </CardContent></Card>)}</div> : <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No menu items match your search.</div>}
  </section>;
}
