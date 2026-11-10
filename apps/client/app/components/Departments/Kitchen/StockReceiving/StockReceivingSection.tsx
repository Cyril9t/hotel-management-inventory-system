import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useKitchenOperations } from "~/Context/KitchenOperationsContext";
import { DiscrepancyBadge } from "./DiscrepancyBadge";
import { AcknowledgeDeliveryModal } from "./AcknowledgeDeliveryModal";
import type { StockMovement } from "~/services/stock";

function isAcknowledged(movement: StockMovement) {
    return movement.acknowledgedAt !== null || movement.acknowledgedQuantity !== null;
}

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function StockReceivingSection() {
    const { stockMovements, stockLoading, stockError, pendingStockIds, refreshStock, acknowledgeStock } = useKitchenOperations();
    const [filter, setFilter] = useState<"ALL" | "PENDING">("ALL");
    const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => { void refreshStock(); }, [refreshStock]);

    const pendingCount = stockMovements.filter((movement) => !isAcknowledged(movement)).length;
    const discrepancyCount = stockMovements.filter((movement) => movement.acknowledgedQuantity !== null && movement.acknowledgedQuantity !== movement.quantity).length;
    const visibleMovements = useMemo(() => filter === "PENDING" ? stockMovements.filter((movement) => !isAcknowledged(movement)) : stockMovements, [filter, stockMovements]);

    function openMovement(movement: StockMovement) {
        setSelectedMovement(movement);
        setDialogOpen(true);
    }

    async function confirmAcknowledgement(movementId: string, quantity: number) {
        await acknowledgeStock(movementId, quantity);
    }

    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-primary/10 p-2.5 text-primary"><Truck className="h-5 w-5" /></span>
                    <div><h2 className="text-lg font-semibold text-foreground">Stock Receiving</h2><p className="mt-1 text-sm text-muted-foreground">Check quantities issued to Kitchen by Store, then record what physically arrived.</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">{pendingCount} awaiting count</span>
                    {discrepancyCount > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-warning/30 bg-brand-warning/5 px-3 py-1.5 text-xs text-brand-warning"><AlertCircle className="h-3.5 w-3.5" />{discrepancyCount} discrepancy</span>}
                    <Button type="button" variant="outline" onClick={() => void refreshStock(true)} disabled={stockLoading} className="h-9 gap-2"><RefreshCw className={`h-4 w-4 ${stockLoading ? "animate-spin" : ""}`} />Refresh</Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-6">
                <p className="text-sm text-muted-foreground">Store issues addressed to Kitchen</p>
                <label className="sr-only" htmlFor="kitchen-stock-filter">Filter stock deliveries</label>
                <select id="kitchen-stock-filter" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"><option value="ALL">All deliveries</option><option value="PENDING">Awaiting count</option></select>
            </div>

            {stockError && <div role="alert" className="flex flex-col gap-2 border-b border-destructive/20 bg-destructive/5 px-5 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>{stockError}</span><button type="button" onClick={() => void refreshStock(true)} className="self-start font-semibold underline sm:self-auto">Retry</button></div>}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><tr>
                        <th scope="col" className="px-5 py-4">Item</th><th scope="col" className="px-4 py-4 text-right">Issued quantity</th><th scope="col" className="px-4 py-4 text-right">Received quantity</th><th scope="col" className="px-4 py-4">Status</th><th scope="col" className="px-5 py-4 text-right">Action</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {stockLoading && stockMovements.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Loading stock deliveries…</span></td></tr>
                            : stockError && stockMovements.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">Stock deliveries could not be loaded. Retry the request above.</td></tr>
                            : visibleMovements.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center"><PackageCheck className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 font-medium text-foreground">{filter === "PENDING" ? "No deliveries are awaiting verification" : "No stock deliveries found"}</p><p className="mt-1 text-sm text-muted-foreground">Kitchen deliveries will appear here when Store issues stock to this department.</p></td></tr>
                                : visibleMovements.map((movement) => {
                                    const received = movement.acknowledgedQuantity;
                                    const pending = pendingStockIds.includes(movement.id);
                                    return <tr key={movement.id} className="align-middle transition-colors hover:bg-muted/20">
                                        <td className="px-5 py-4"><p className="font-medium text-foreground">{movement.product?.name ?? `Product ID ${movement.productId.slice(0, 8)}`}</p><p className="mt-1 text-xs text-muted-foreground">From {movement.fromDepartment ?? "not provided"} · {formatDate(movement.createdAt)}</p></td>
                                        <td className="px-4 py-4 text-right font-mono font-medium text-foreground">{movement.quantity}</td>
                                        <td className="px-4 py-4 text-right font-mono font-medium text-foreground">{received === null ? <span className="font-sans text-muted-foreground">Not counted</span> : received}</td>
                                        <td className="px-4 py-4"><DiscrepancyBadge issuedQuantity={movement.quantity} acknowledgedQuantity={received} /></td>
                                        <td className="px-5 py-4 text-right"><Button type="button" variant={isAcknowledged(movement) ? "outline" : "default"} size="sm" disabled={pending} onClick={() => openMovement(movement)} className="h-9 gap-2">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isAcknowledged(movement) ? <PackageCheck className="h-4 w-4" /> : null}{pending ? "Saving…" : isAcknowledged(movement) ? "View" : "Acknowledge"}</Button></td>
                                    </tr>;
                                })}
                    </tbody>
                </table>
            </div>

            <AcknowledgeDeliveryModal movement={selectedMovement} isOpen={dialogOpen} isPending={selectedMovement ? pendingStockIds.includes(selectedMovement.id) : false} onClose={() => setDialogOpen(false)} onConfirm={confirmAcknowledgement} />
        </section>
    );
}
