import React from "react";
import { Users, Building2 } from "lucide-react";
import { ThemeToggle } from "~/components/shared/ThemeToggle";

interface HeaderProps {
    totalStaff: number;
}

export const HotelDepartmentsHeader: React.FC<HeaderProps> = ({ totalStaff }) => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        Hotel Operations
                    </p>
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
                    Departments
                </h1>
                <p className="max-w-2xl text-xs text-muted-foreground">
                    A snapshot of the teams that keep Brandy Hotel running smoothly.
                </p>
            </div>

            {/* Total Staff KPI Badge */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-sm">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary border border-primary/20">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-serif font-bold leading-none text-foreground">
                            {totalStaff}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Total Active Staff
                        </p>
                    </div>
                </div>
                <ThemeToggle />
            </div>
        </div>
    );
};
