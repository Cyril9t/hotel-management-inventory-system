import React from 'react';
import { User, Clock, ShieldCheck, X } from 'lucide-react';

export interface ShiftHeaderProps {
    staffName: string;
    department: string;
    openedAt: string;
    closedAt: string;
    onClose?: () => void;
}

export const CloseShiftHeader: React.FC<ShiftHeaderProps> = ({
    staffName,
    department,
    openedAt,
    closedAt,
    onClose,
}) => {
    return (
        <div className="rounded-xl bg-card p-6 ">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Close Shift
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-0.5 text-[12px] font-semibold text-primary">
                            <ShieldCheck className="h-3 w-3" /> Active Session
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Reconcile shift payments, verify physical drawer cash, and complete shift handover.
                    </p>
                </div>
            </div>


            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border/80 bg-secondary/40 p-3 text-sm">
                <div className="flex items-center gap-2 pr-3 border-r border-border">
                    <User size={20} className=" text-primary" />
                    <span className="font-medium text-foreground">{staffName}</span>
                    <span className="text-muted-foreground">({department})</span>
                </div>

                <div className="flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    <span className="text-muted-foreground">Shift:</span>
                    <span className="font-semibold text-foreground">{openedAt}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-foreground">{closedAt}</span>
                </div>
            </div>
        </div>
    );
};