import React from 'react';
import { Package, Plus, ArrowUpRight, Search, ShieldCheck } from 'lucide-react';

export interface StoreHeaderProps {
  onReceiveStock: () => void;
  onIssueStock: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const StoreManagerHeader: React.FC<StoreHeaderProps> = ({
  onReceiveStock,
  onIssueStock,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Central Inventory & Supply Chain
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold  text-foreground">
          Store Manager Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor stock health, manage store issues to departments, and track ledger movements.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">

        <div className="relative w-full sm:w-100">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory items..."
            className="w-full h-10 pl-9 pr-3 py-2 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

      </div>
    </div>
  );
};