import { Package } from "lucide-react";
import { useAuth } from "~/Context/AuthContext";
import type { Department } from "../Department";
import { StockManagementWorkspace, StoreStockDataProvider, useOptionalStoreStockData } from "~/components/Departments/Store/StockManagementWorkspace";

interface StoreManagerViewProps {
    department?: Department;
    initialSection?: "overview" | "inventory" | "products" | "receiving" | "distribution" | "corrections" | "movements";
    showSectionNavigation?: boolean;
}

export function StoreManagerView({ department, initialSection = "overview", showSectionNavigation = true }: StoreManagerViewProps) {
    const { user } = useAuth();
    const existingStockData = useOptionalStoreStockData();
    const isStoreManager = (user?.role ?? "").trim().toLowerCase().replace(/[ -]+/g, "_") === "store_manager";
    return <div className="space-y-6">
        <header className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Package className="h-6 w-6" aria-hidden="true" /></span>
                <div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{department?.code || "STORE MANAGEMENT"}</span>{!isStoreManager && <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Read-only oversight</span>}</div><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Store Manager</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{isStoreManager ? "Manage products, register stock received into STORE and distribute available stock between hotel departments." : "Monitor the product catalogue, stock balances across departments, low-stock items and recorded inventory activity."}</p></div>
                </div>
            </div>
        </header>
        {existingStockData
            ? <StockManagementWorkspace initialSection={initialSection} showSectionNavigation={showSectionNavigation} />
            : <StoreStockDataProvider><StockManagementWorkspace initialSection={initialSection} showSectionNavigation={showSectionNavigation} /></StoreStockDataProvider>}
    </div>;
}

export default StoreManagerView;
