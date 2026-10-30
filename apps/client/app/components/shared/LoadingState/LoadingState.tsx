import React from 'react'
import { Skeleton } from '~/components/ui/skeleton'

export const GlobalLoadingSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground space-y-6 p-4 md:p-8 animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. Header Skeleton Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl bg-secondary/80" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-32 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>

                {/* 2. Banner / Notice Alert Skeleton */}
                <Skeleton className="w-full h-12 rounded-xl bg-secondary/40 border border-border/40" />

                {/* 3. Metric KPI Cards Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-7 w-7 rounded-lg" />
                            </div>
                            <Skeleton className="h-7 w-32" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    ))}
                </div>

                {/* 4. Filter Control Bar Skeleton */}
                <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Skeleton className="h-9 w-full sm:w-80 rounded-[var(--radius)]" />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Skeleton className="h-9 w-28 rounded-[var(--radius)]" />
                        <Skeleton className="h-9 w-28 rounded-[var(--radius)]" />
                        <Skeleton className="h-9 w-32 rounded-[var(--radius)]" />
                    </div>
                </div>

                {/* 5. Main Content Split Layout (Table + Side Drawer/Panel) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Main Table Skeleton (2 Columns) */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden shadow-sm">

                        {/* Table Header Row Skeleton */}
                        <div className="p-4 border-b border-border bg-secondary/40 flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </div>

                        {/* Table Rows Skeleton */}
                        <div className="divide-y divide-border/60">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-3.5 w-36" />
                                            <Skeleton className="h-2.5 w-24" />
                                        </div>
                                    </div>

                                    <Skeleton className="h-3.5 w-20 hidden md:block" />
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                    <Skeleton className="h-4 w-16 font-mono" />
                                    <Skeleton className="h-8 w-16 rounded-[var(--radius)]" />
                                </div>
                            ))}
                        </div>

                        {/* Table Pagination Footer Skeleton */}
                        <div className="p-3.5 border-t border-border bg-card flex items-center justify-between">
                            <Skeleton className="h-3 w-36" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-7 w-7 rounded-[var(--radius)]" />
                                <Skeleton className="h-7 w-7 rounded-[var(--radius)]" />
                                <Skeleton className="h-7 w-7 rounded-[var(--radius)]" />
                            </div>
                        </div>

                    </div>

                    {/* Quick Actions / Side Drawer Skeleton (1 Column) */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                        <Skeleton className="h-4 w-28" />
                        <div className="space-y-3 pt-1">
                            <Skeleton className="h-10 w-full rounded-[var(--radius)]" />
                            <Skeleton className="h-10 w-full rounded-[var(--radius)]" />
                            <Skeleton className="h-10 w-full rounded-[var(--radius)]" />
                            <Skeleton className="h-10 w-full rounded-[var(--radius)]" />
                        </div>

                        <div className="pt-4 border-t border-border space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default GlobalLoadingSkeleton