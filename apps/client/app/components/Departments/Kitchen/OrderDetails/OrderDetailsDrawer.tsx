import { useState } from "react";
import { Clock, LoaderCircle, RefreshCw, UserRound } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { KitchenOrderStatusBadge } from "../Orders/KitchenOrderStatusBadge";
import { getNextKitchenOrderStatus, type KitchenOrder, type KitchenOrderDetails, type KitchenOrderTransition } from "~/services/kitchen";

type Props = {
    order: KitchenOrder | null;
    details: KitchenOrderDetails | null;
    isOpen: boolean;
    isLoading?: boolean;
    error?: string;
    isPending?: boolean;
    onClose: () => void;
    onRetry?: () => void;
    onAdvanceStatus?: (orderId: string, status: KitchenOrderTransition) => Promise<void>;
};

export function OrderDetailsDrawer({ order, details, isOpen, isLoading = false, error = "", isPending = false, onClose, onRetry, onAdvanceStatus }: Props) {
    const [actionError, setActionError] = useState("");
    if (!order) return null;
    const orderId = order.id;
    const nextStatus = getNextKitchenOrderStatus(order.status);
    const timestamp = new Date(order.createdAt);
    const placedAt = Number.isNaN(timestamp.getTime()) ? "Not available" : timestamp.toLocaleString();

    async function advance() {
        if (!nextStatus || !onAdvanceStatus) return;
        setActionError("");
        try {
            await onAdvanceStatus(orderId, nextStatus);
        } catch (requestError: any) {
            setActionError(requestError?.response?.data?.error?.message ?? requestError?.message ?? "Could not update this order.");
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto border-l border-border bg-card p-0 sm:max-w-xl">
                <SheetHeader className="space-y-3 border-b border-border bg-muted/20 p-6 pr-14">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <SheetTitle className="font-mono text-base font-semibold text-foreground">Kitchen Order · {order.id.slice(0, 8)}</SheetTitle>
                        <KitchenOrderStatusBadge status={order.status} />
                    </div>
                    <SheetDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{placedAt}</span>
                        <span>Destination: {order.destination.trim() || "Not provided"}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 p-6">
                    <dl className="grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
                        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</dt><dd className="mt-1 text-sm font-medium text-foreground">{details?.sale.sourceDepartment ?? "Not provided"}</dd></div>
                        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requester ID</dt><dd className="mt-1 flex items-center gap-1.5 break-all text-sm font-medium text-foreground"><UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />{order.createdByUserId}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sale ID</dt><dd className="mt-1 break-all font-mono text-sm text-foreground">{order.saleId}</dd></div>
                    </dl>

                    <section aria-labelledby="kitchen-order-items-title" className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div><h3 id="kitchen-order-items-title" className="font-semibold text-foreground">Order items</h3><p className="mt-1 text-sm text-muted-foreground">Product names and quantities from the order details API.</p></div>
                            {isLoading && <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                        {error && <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
                            <span>{error}</span><Button type="button" variant="outline" size="sm" onClick={onRetry} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
                        </div>}
                        {details ? <div className="overflow-hidden rounded-lg border border-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-right">Quantity</th></tr></thead>
                                <tbody className="divide-y divide-border">{details.items.map((item) => <tr key={item.id}><td className="px-4 py-4 font-medium text-foreground">{item.product.name}</td><td className="px-4 py-4 text-right font-mono text-foreground">× {item.quantity}</td></tr>)}</tbody>
                            </table>
                            {!details.items.length && <p className="p-5 text-sm text-muted-foreground">No item lines were returned for this order.</p>}
                        </div> : !error && <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{isLoading ? "Loading order details…" : "Product details are not available."}</p>}
                    </section>

                    {actionError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{actionError}</p>}
                </div>

                <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-t border-border bg-muted/20 p-5">
                    <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                    {nextStatus && <Button type="button" onClick={() => void advance()} disabled={isPending} className="gap-2">
                        {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {isPending ? "Updating…" : order.status === "INCOMING" ? "Start preparing" : order.status === "PREPARING" ? "Mark ready" : "Mark delivered"}
                    </Button>}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
