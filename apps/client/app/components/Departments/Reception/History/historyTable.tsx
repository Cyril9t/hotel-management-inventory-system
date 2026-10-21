import React from 'react';
import {
    UserCheck,
    LogOut,
    CalendarCheck,
    Coffee,
    CreditCard,
    ArrowRightLeft,
    HelpCircle,
    Eye,
    User
} from 'lucide-react';

export interface ActivityRecord {
    id: string;
    type: string;
    time: string;
    date: string;
    title: string;
    details: string;
    meta: string;
    amount?: number;
    paymentMethod?: string;
    staffName: string;
    staffRole: string;
    status: string;
    statusColor: string;
    refId: string;
}

export const HistoryTable: React.FC<{
    records: ActivityRecord[];
    onSelectRecord: (rec: ActivityRecord) => void;
}> = ({ records, onSelectRecord }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'checkin': return <UserCheck className="w-4 h-4 text-emerald-400" />;
            case 'checkout': return <LogOut className="w-4 h-4 text-sky-400" />;
            case 'booking': return <CalendarCheck className="w-4 h-4 text-amber-400" />;
            case 'roomservice': return <Coffee className="w-4 h-4 text-purple-400" />;
            case 'payment': return <CreditCard className="w-4 h-4 text-emerald-400" />;
            case 'shift': return <ArrowRightLeft className="w-4 h-4 text-primary" />;
            default: return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="p-3.5 pl-4">Time & Event</th>
                            <th className="p-3.5">Activity Details</th>
                            <th className="p-3.5">Staff On Duty</th>
                            <th className="p-3.5">Amount / Method</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 pr-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                        {records.map((rec) => (
                            <tr key={rec.id} className="hover:bg-secondary/20 transition-colors">

                                {/* Time & Type Icon */}
                                <td className="p-3.5 pl-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-secondary/60">
                                            {getIcon(rec.type)}
                                        </div>
                                        <div>
                                            <p className="font-bold font-mono text-xs">{rec.time}</p>
                                            <p className="text-[10px] text-muted-foreground">{rec.date}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Details */}
                                <td className="p-3.5">
                                    <p className="font-bold text-foreground">{rec.title}</p>
                                    <p className="text-[11px] text-muted-foreground">{rec.details}</p>
                                    <p className="text-[10px] text-primary/80 font-mono mt-0.5">{rec.meta}</p>
                                </td>

                                {/* Staff */}
                                <td className="p-3.5">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                        <div>
                                            <p className="font-semibold">{rec.staffName}</p>
                                            <p className="text-[10px] text-muted-foreground">{rec.staffRole}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Amount */}
                                <td className="p-3.5 font-serif font-bold">
                                    {rec.amount ? (
                                        <div>
                                            <p className="text-foreground">₦ {rec.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-sans font-normal text-muted-foreground">{rec.paymentMethod}</p>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground font-sans font-normal text-[11px]">—</span>
                                    )}
                                </td>

                                {/* Status Badge */}
                                <td className="p-3.5">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rec.statusColor}`}>
                                        {rec.status}
                                    </span>
                                </td>

                                {/* Action */}
                                <td className="p-3.5 pr-4 text-right">
                                    <button
                                        onClick={() => onSelectRecord(rec)}
                                        className="px-3 py-1.5 text-[11px] font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5 text-primary" />
                                        <span>View</span>
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};