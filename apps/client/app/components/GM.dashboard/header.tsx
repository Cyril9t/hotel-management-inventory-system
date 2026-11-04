import { Calendar } from "lucide-react";
import { ThemeToggle } from "~/components/shared/ThemeToggle";

export function Header() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold font-serif text-foreground tracking-tight">Hotel Overview</h1>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase bg-secondary/60 px-2.5 py-0.5 rounded">
                        Executive Suite
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Real-time consolidated operations & departmental yield
                </p>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-[var(--radius)] text-xs font-medium text-foreground shadow-sm">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Today, {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-[var(--radius)] text-xs font-semibold text-foreground shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-brand-warning animate-pulse" />
                    <span>Live Feed</span>
                </div>
            </div>
        </div>
    );
}
