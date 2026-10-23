
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[16px] font-semibold text-muted-foreground">Total Requests</span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Utensils className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className=" f text-3xl font-bold text-foreground">{total}</span>

                </div>
                <p className="text-sm text-muted-foreground">Total request across all departments</p>
            </div>


            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[16px] font-semibold text-muted-foreground">In Progress</span>
                    <div className="p-2 rounded-lg bg-brand-warning/10 text-brand-warning">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className=" f text-3xl font-bold text-foreground">{inProgress}</span>

                </div>
                <p className="text-sm text-muted-foreground">Being prepared or delivered</p>
            </div>


            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[16px] font-semibold text-muted-foreground">Completed</span>
                    <div className="p-2 rounded-lg bg-brand-success/10 text-brand-success">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className=" f text-3xl font-bold text-foreground">{completed}</span>
                </div>
                <p className="text-sm text-muted-foreground">Successfully served to room</p>
            </div>


            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[16px] font-semibold text-muted-foreground">Voided</span>
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                        <XCircle className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className=" f text-2xl font-bold text-foreground">{cancelled}</span>

                </div>
                <p className="text-sm text-muted-foreground">Canceled by guest or staff</p>
            </div>
        </div>
    );
};