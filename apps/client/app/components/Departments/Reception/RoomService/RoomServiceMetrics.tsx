
import { Utensils, Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface MetricsProps {
    total: number;
    inProgress: number;
    completed: number;
    cancelled: number;
}

export const RoomServiceMetrics: React.FC<MetricsProps> = ({
    total,
    inProgress,
    completed,
    cancelled,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Requests */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Total Requests</span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Utensils className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-bold text-foreground">{total}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        +33%
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Compared to previous shift</p>
            </div>

            {/* In Progress */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">In Progress</span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-bold text-foreground">{inProgress}</span>
                    <span className="text-[10px] font-bold text-amber-400">41.7%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Being prepared or delivered</p>
            </div>

            {/* Completed */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Completed</span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-bold text-foreground">{completed}</span>
                    <span className="text-[10px] font-bold text-emerald-400">50%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Successfully served to room</p>
            </div>

            {/* Cancelled */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Cancelled</span>
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                        <XCircle className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-bold text-foreground">{cancelled}</span>
                    <span className="text-[10px] font-bold text-destructive">8.3%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Cancelled by guest or staff</p>
            </div>
        </div>
    );
};