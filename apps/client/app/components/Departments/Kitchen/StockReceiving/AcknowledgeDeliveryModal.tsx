import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, PackageCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { StockMovement } from "~/services/stock";

type Props = {
    movement: StockMovement | null;
    isOpen: boolean;
    isPending?: boolean;
    onClose: () => void;
    onConfirm: (movementId: string, receivedQuantity: number) => Promise<void>;
};

export function AcknowledgeDeliveryModal({ movement, isOpen, isPending = false, onClose, onConfirm }: Props) {
    const [receivedQuantity, setReceivedQuantity] = useState("");
    const [error, setError] = useState("");
    useEffect(() => {
        if (!movement || !isOpen) return;
        setReceivedQuantity(String(movement.acknowledgedQuantity ?? movement.quantity));
        setError("");
    }, [movement?.id, isOpen]);

    if (!movement) return null;
    const movementId = movement.id;
    const isAcknowledged = movement.acknowledgedAt !== null || movement.acknowledgedQuantity !== null;
    const quantity = Number(receivedQuantity);
    const hasValidQuantity = receivedQuantity.trim() !== "" && Number.isInteger(quantity) && quantity >= 0;
    const difference = hasValidQuantity ? quantity - movement.quantity : 0;

    async function submit() {
        if (!hasValidQuantity || isAcknowledged || isPending) return;
        setError("");
        try {
            await onConfirm(movementId, quantity);
            onClose();
        } catch (requestError: any) {
            setError(requestError?.response?.data?.error?.message ?? requestError?.message ?? "Could not acknowledge this delivery.");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="border border-border bg-card sm:max-w-lg">
                <DialogHeader>
                    <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><PackageCheck className="size-5" /></div>
                    <DialogTitle className="text-lg font-semibold text-foreground">{isAcknowledged ? "Delivery acknowledgement" : "Acknowledge stock delivery"}</DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground">Enter the quantity physically received. The Kitchen API accepts a non-negative whole number and records discrepancies against the issued quantity.</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <dl className="grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</dt><dd className="mt-1 font-medium text-foreground">{movement.product?.name ?? `Product ID ${movement.productId}`}</dd></div>
                        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Issued quantity</dt><dd className="mt-1 font-mono font-semibold text-foreground">{movement.quantity}</dd></div>
                        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</dt><dd className="mt-1 font-medium text-foreground">{movement.fromDepartment ?? "Not provided"}</dd></div>
                    </dl>

                    <div className="space-y-2">
                        <Label htmlFor="kitchen-received-quantity">Actual quantity received</Label>
                        <Input id="kitchen-received-quantity" type="number" min={0} step={1} inputMode="numeric" value={receivedQuantity} disabled={isAcknowledged || isPending} onChange={(event) => setReceivedQuantity(event.target.value)} className="h-11 text-base" />
                    </div>

                    {isAcknowledged && movement.acknowledgedQuantity !== null ? <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">Recorded quantity: <strong className="text-foreground">{movement.acknowledgedQuantity}</strong></p>
                        : hasValidQuantity && difference !== 0 ? <div className="flex gap-3 rounded-lg border border-brand-warning/30 bg-brand-warning/5 p-4 text-sm text-foreground"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-warning" /><span>Discrepancy: {difference > 0 ? `+${difference}` : difference}. The received quantity differs from the {movement.quantity} issued.</span></div>
                            : hasValidQuantity ? <div className="flex gap-3 rounded-lg border border-brand-success/30 bg-brand-success/5 p-4 text-sm text-foreground"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-success" /><span>The received quantity matches the issued quantity.</span></div> : null}
                    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                    {!isAcknowledged && <Button type="button" onClick={() => void submit()} disabled={!hasValidQuantity || isPending} className="gap-2">
                        {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}{isPending ? "Saving…" : "Confirm received quantity"}
                    </Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
