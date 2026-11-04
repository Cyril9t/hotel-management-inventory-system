import { User, ShieldCheck } from 'lucide-react';

export interface ShiftHeaderProps {
    staffName: string;
    department: string;
    shiftId: string;
}


export const CloseShiftHeader: React.FC<ShiftHeaderProps> = ({ staffName, department, shiftId }) => (
    <div className="rounded-xl bg-card p-6">
        <div className="flex items-start justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Close Shift</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-0.5 text-[12px] font-semibold text-primary"><ShieldCheck className="h-3 w-3" />Active Session</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Count the drawer and close your active shift.</p>
            </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border/80 bg-secondary/40 p-3 text-sm">
            <div className="flex items-center gap-2 border-r border-border pr-3"><User size={20} className="text-primary" /><span className="font-medium text-foreground">{staffName}</span><span className="text-muted-foreground">({department})</span></div>
            <div className="min-w-0"><span className="text-muted-foreground">Shift ID: </span><span className="break-all font-mono text-xs font-semibold text-foreground">{shiftId}</span></div>
        </div>
    </div>
);
