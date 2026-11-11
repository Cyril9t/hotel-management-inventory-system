import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { BarIncomingOrderStatus } from "../types";

export type OrderFilter = "All Orders" | BarIncomingOrderStatus;
export function IncomingOrderFilters({ filter, onFilter, search, onSearch }: { filter: OrderFilter; onFilter: (filter: OrderFilter) => void; search: string; onSearch: (search: string) => void }) {
  const filters: OrderFilter[] = ["All Orders", "Pending", "Delivered"];
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-2 overflow-x-auto">{filters.map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "outline"} onClick={() => onFilter(item)}>{item}</Button>)}</div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Search order reference" placeholder="Search order reference" value={search} onChange={(event) => onSearch(event.target.value)} className="pl-9"/></div></div>;
}
