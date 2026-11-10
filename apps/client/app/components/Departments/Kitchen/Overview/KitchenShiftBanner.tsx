import { useState } from "react";
import { ChefHat, Clock3, LoaderCircle, Power, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/Context/AuthContext";
import { useShift } from "~/Context/ShiftContext";
import { KitchenShiftModal } from "../Shift/KitchenShiftModal";

function describeError(error: any) {
    return error?.response?.data?.error?.message ?? error?.message ?? "Could not update the Kitchen shift.";
}

export function KitchenShiftBanner() {
    const { user } = useAuth();
    const { currentShift, currentShiftLoading, currentShiftError, refreshCurrentShift, startShift, finishShift } = useShift();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [mode, setMode] = useState<"OPEN" | "CLOSE">("OPEN");
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState("");
    const staffName = [user?.firstName, user?.lastName].filter((part) => typeof part === "string" && part.trim()).join(" ") || "Kitchen staff";
    const isActive = currentShift?.status === "OPEN";

    function openDialog(nextMode: "OPEN" | "CLOSE") {
        setMode(nextMode);
        setActionError("");
        setDialogOpen(true);
    }

    async function confirmShiftAction() {
        setSubmitting(true);
        setActionError("");
        try {
            if (mode === "OPEN") {
                const result = await startShift(0);
                if (!result?.shift) throw new Error("The API did not return the opened Kitchen shift.");
            } else {
                await finishShift(0);
            }
            setDialogOpen(false);
        } catch (error) {
            setActionError(describeError(error));
        } finally {
            setSubmitting(false);
        }
    }

    return <>
        <section aria-label="Kitchen shift" className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
                <span className="rounded-lg bg-primary/10 p-2.5 text-primary"><ChefHat className="h-5 w-5" /></span>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground">Kitchen Shift</h2>
                        {currentShiftLoading ? <span className="text-xs text-muted-foreground">Checking status…</span> : currentShiftError ? <span className="text-xs font-medium text-destructive">Status unavailable</span> : <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? "bg-brand-success/10 text-brand-success" : "bg-muted text-muted-foreground"}`}>{isActive ? "Active" : "Not started"}</span>}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{staffName}</span>
                        {isActive && currentShift?.openedAt && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Started {new Date(currentShift.openedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
                        {isActive && currentShift?.id && <span className="font-mono text-xs" title={currentShift.id}>Shift {currentShift.id.slice(0, 8)}</span>}
                        {!isActive && !currentShiftLoading && !currentShiftError && <span>Open a shift to begin tracking Kitchen operations.</span>}
                    </p>
                    {currentShiftError && <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-destructive"><span>{currentShiftError}</span><button type="button" onClick={() => { void refreshCurrentShift().catch(() => {}); }} className="font-semibold underline">Retry</button></div>}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                {currentShiftLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" /> : currentShiftError ? <Button type="button" variant="outline" onClick={() => { void refreshCurrentShift().catch(() => {}); }} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button> : isActive ? <Button type="button" variant="outline" onClick={() => openDialog("CLOSE")} className="gap-2"><Power className="h-4 w-4" />End Shift</Button> : <Button type="button" onClick={() => openDialog("OPEN")} className="gap-2"><Power className="h-4 w-4" />Open Shift</Button>}
            </div>
        </section>
        <KitchenShiftModal isOpen={dialogOpen} mode={mode} staffName={staffName} shiftId={currentShift?.id} isSubmitting={submitting} error={actionError} onClose={() => setDialogOpen(false)} onConfirm={() => void confirmShiftAction()} />
    </>;
}
