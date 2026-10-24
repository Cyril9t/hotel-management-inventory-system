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
import { Button } from '~/components/ui/button';

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
            case 'checkin': return <UserCheck className="w-4 h-4 text-brand-success" />;
            case 'checkout': return <LogOut className="w-4 h-4 text-destructive" />;
            case 'booking': return <CalendarCheck className="w-4 h-4 text-primary" />;
            case 'roomservice': return <Coffee className="w-4 h-4 text-brand-warning" />;
            case 'payment': return <CreditCard className="w-4 h-4 text-brand-success" />;
            case 'shift': return <ArrowRightLeft className="w-4 h-4 text-primary" />;
            default: return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden ">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                    <thead className="h-16 border-border bg-brand-navy-light text-brand-gold-light font-bold uppercase tracking-wider text-[17px]">
                        <tr>
                            <th className="p-4 pl-5">Time & Event</th>
                            <th className="p-4">Activity Details</th>
                            <th className="p-4">Staff On Duty</th>
                            <th className="p-4">Amount / Method</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground font-medium ">
                        {records.map((rec) => (
                            <tr key={rec.id} className="hover:bg-secondary/25  transition-colors">

                                <td className="p-5 pl-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-secondary/60">
                                            {getIcon(rec.type)}
                                        </div>
                                        <div>
                                            <p className=" text-sm">{rec.time}</p>
                                            <p className="text-[12px] text-muted-foreground">{rec.date}</p>
                                        </div>
                                    </div>
                                </td>


                                <td className="p-4 border border-destructive">
                                    <p className="font-semibold text-[16px] text-foreground">{rec.title}</p>
                                    <p className="text-[12px] text-muted-foreground">{rec.details}</p>
                                    <p className="text-[12px] text-primary/80 font-mono mt-0.5">{rec.meta}</p>
                                </td>


                                <td className="p-3.5 border border-destructive">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="font-semibold text-[16px]">{rec.staffName}</p>
                                            <p className="text-[12px] text-muted-foreground">{rec.staffRole}</p>
                                        </div>
                                    </div>
                                </td>


                                <td className="p-3.5 font-bold border border-destructive">
                                    {rec.amount ? (
                                        <div>
                                            <p className="text-foreground text-[16px]">₦ {rec.amount.toLocaleString()}</p>
                                            <p className="text-[12px] font-sans font-normal text-muted-foreground">{rec.paymentMethod}</p>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground font-sans font-normal text-[11px]">—</span>
                                    )}
                                </td>


                                <td className="p-3.5 border border-destructive">
                                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold `}>
                                        {rec.status}
                                    </span>
                                </td>


                                <td className="p-3.5 pr-4 text-right">
                                    <Button
                                        onClick={() => onSelectRecord(rec)}
                                        className="px-3 py-1.5 text-[11px] font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5 text-primary" />
                                        <span>View</span>
                                    </Button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};