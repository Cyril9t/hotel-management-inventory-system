import React from "react";
import { Building2, Layers3 } from "lucide-react";

interface HeaderProps {
    departmentCount: number;
}

export const HotelDepartmentsHeader: React.FC<HeaderProps> = ({ departmentCount }) => (
    <header className="flex flex-col gap-6 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <Building2 aria-hidden="true" className="h-3.5 w-3.5" />
                Hotel operations
            </div>
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Departments</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Manage and oversee the teams and services that keep your hotel running.
                </p>
            </div>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers3 aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
                <span className="block text-xl font-semibold leading-none text-foreground">{departmentCount}</span>
                <span className="mt-1 block text-xs text-muted-foreground">Departments</span>
            </span>
        </div>
    </header>
);
