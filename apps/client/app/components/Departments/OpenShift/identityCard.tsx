import React from 'react';
import { ShieldCheck, UserCheck, Clock, Building2 } from 'lucide-react';

export interface StaffProfileProps {
    staffName: string;
    department: string;
    role: string;
    avatarUrl?: string;
    openingTimestamp: string;
}

export const StaffIdentityCard: React.FC<StaffProfileProps> = ({
    staffName,
    department,
    role,
    avatarUrl,
    openingTimestamp,
}) => {
    return (
        <div className="rounded-xl border border-border/80 bg-brand-navy-light p-5 ">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">


                <div className="flex items-center gap-4">
                    <div className="relative">

                        <div className="w-12 h-12 rounded-full bg-accent border-2 border-primary/40 flex items-center justify-center font-bold font-serif text-lg text-primary">
                            {staffName.split(' ').map(n => n[0]).join('')}
                        </div>

                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-brand-navy-light" title="Authenticated Session" />
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-background tracking-wider">
                                {staffName}
                            </h2>
                            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-primary/20 text-primary">
                                Auto Detected
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 font-medium text-background">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                {role}
                            </span>

                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 sm:border-l sm:border-border/60 sm:pl-5 pt-3 sm:pt-0 border-t border-border/40 sm:border-t-0">
                    <div className="p-2 rounded-lg ">
                        <Clock size={25} className="text-primary" />
                    </div>
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-background/70">
                            Shift Start Time
                        </span>
                        <p className="text-xs font-bold text-background font-mono">
                            {openingTimestamp}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};