import { Clock3, Fingerprint, ShieldCheck } from "lucide-react";
import { KitchenShiftBanner } from "~/components/Departments/Kitchen/Overview/KitchenShiftBanner";
import { useShift } from "~/Context/ShiftContext";

export default function KitchenShiftPage() {
    const { currentShift, currentShiftLoading, currentShiftError } = useShift();
    const openedAt = currentShift?.openedAt ? new Date(currentShift.openedAt) : null;
    return <div className="mx-auto w-full max-w-5xl space-y-6">
        <header><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Kitchen Shift</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">View the active Kitchen work session and manage its opening or closure.</p></header>
        <KitchenShiftBanner />
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="rounded-lg bg-primary/10 p-2.5 text-primary"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-semibold text-foreground">Current shift details</h2><p className="mt-1 text-sm text-muted-foreground">Shift information returned by the authenticated shifts API.</p></div></div>
            {currentShiftLoading ? <p role="status" className="mt-6 text-sm text-muted-foreground">Loading current shift…</p>
                : currentShiftError ? <p role="alert" className="mt-6 text-sm text-destructive">{currentShiftError}</p>
                    : currentShift ? <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shift ID</dt><dd className="mt-2 break-all font-mono text-sm text-foreground"><Fingerprint className="mr-2 inline h-4 w-4 text-muted-foreground" />{currentShift.id}</dd></div>
                        <div className="rounded-lg border border-border bg-background p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</dt><dd className="mt-2 text-sm font-medium text-foreground">{currentShift.department ?? "Not provided"}</dd></div>
                        <div className="rounded-lg border border-border bg-background p-4 sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opened at</dt><dd className="mt-2 text-sm text-foreground"><Clock3 className="mr-2 inline h-4 w-4 text-muted-foreground" />{openedAt && !Number.isNaN(openedAt.getTime()) ? openedAt.toLocaleString() : "Not provided"}</dd></div>
                    </dl> : <p className="mt-6 text-sm text-muted-foreground">There is no active Kitchen shift.</p>}
        </section>
    </div>;
}
