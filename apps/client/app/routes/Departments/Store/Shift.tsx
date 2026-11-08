import { useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Package } from "lucide-react";
import { useAuth } from "~/Context/AuthContext";
import { Button } from "~/components/ui/button";

export default function StoreManagerShift() {
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await clearSession();
        } finally {
            navigate("/", { replace: true });
        }
    }

    return <section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Store Management</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Shift</h1>
                </div>
            </div>
            <Button variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => void handleLogout()} disabled={loggingOut}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {loggingOut ? "Logging out…" : "Logout"}
            </Button>
        </div>
    </section>;
}
