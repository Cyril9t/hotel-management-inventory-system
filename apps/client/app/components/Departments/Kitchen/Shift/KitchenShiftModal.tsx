import { CheckCircle2, ChefHat, LoaderCircle, Power } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

type Props = {
    isOpen: boolean;
    mode: "OPEN" | "CLOSE";
    staffName: string;
    shiftId?: string;
    isSubmitting?: boolean;
    error?: string;
    onClose: () => void;
    onConfirm: () => void;
};

export function KitchenShiftModal({ isOpen, mode, staffName, shiftId, isSubmitting = false, error = "", onClose, onConfirm }: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="border border-border bg-card sm:max-w-md">
                <DialogHeader>
                    <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><ChefHat className="size-5" /></div>
                    <DialogTitle className="text-lg font-semibold text-foreground">{mode === "OPEN" ? "Open Kitchen Shift" : "Close Kitchen Shift"}</DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{mode === "OPEN" ? "Start a Kitchen shift to record preparation and stock receiving activity." : "Close the current Kitchen shift when operations are complete."}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <div className="rounded-lg border border-border bg-background p-4 text-sm"><p><span className="text-muted-foreground">Staff: </span><strong className="text-foreground">{staffName}</strong></p>{shiftId && <p className="mt-2 break-all"><span className="text-muted-foreground">Shift ID: </span><span className="font-mono text-xs text-foreground">{shiftId}</span></p>}</div>
                    <p className="text-sm text-muted-foreground">Kitchen shift actions record no cash float.</p>
                    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button type="button" onClick={onConfirm} disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : mode === "OPEN" ? <Power className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {isSubmitting ? "Saving…" : mode === "OPEN" ? "Open shift" : "Close shift"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
