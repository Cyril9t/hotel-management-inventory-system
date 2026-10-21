import React from 'react';
import {
    X,
    User,
    CreditCard,
    Calendar,
    Clock,
    Printer,
    CheckCircle2,
    ShieldCheck,
    Receipt,
    Building2,
    FileText
} from 'lucide-react';
import { type ActivityRecord } from './historyTable';

export interface ActivityDetailModalProps {
    isOpen: boolean;
    record: ActivityRecord | null;
    onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
    isOpen,
    record,
    onClose,
}) => {
    if (!isOpen || !record) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Modal Card Box */}
            <div className="relative w-full max-w-lg bg-card border border-border text-foreground shadow-2xl overflow-hidden rounded-[var(--radius)] flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold font-serif text-foreground tracking-tight">
                                    Audit Record Details
                                </h3>
                                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-secondary text-primary">
                                    {record.id}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Front Desk Logged Event • Ref: {record.refId}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-5 overflow-y-auto text-xs">

                    {/* Status & Event Title Banner */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-secondary/30">
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                Activity Type
                            </p>
                            <h4 className="text-sm font-bold text-foreground mt-0.5">
                                {record.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">{record.details}</p>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${record.statusColor}`}>
                            {record.status}
                        </span>
                    </div>

                    {/* Event Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-card">

                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" /> Timestamp
                            </span>
                            <p className="font-bold text-foreground font-mono">{record.time}</p>
                            <p className="text-[10px] text-muted-foreground">{record.date}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                <User className="w-3 h-3 text-primary" /> Staff on Duty
                            </span>
                            <p className="font-bold text-foreground">{record.staffName}</p>
                            <p className="text-[10px] text-muted-foreground">{record.staffRole}</p>
                        </div>

                    </div>

                    {/* Transaction & Billing Breakdown */}
                    <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                        <h5 className="font-bold text-foreground text-xs flex items-center gap-1.5 border-b border-border/60 pb-2">
                            <CreditCard className="w-3.5 h-3.5 text-primary" />
                            Financial & Payment Log
                        </h5>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="font-semibold text-foreground">{record.paymentMethod || 'N/A'}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Transaction Ref ID</span>
                                <span className="font-mono text-primary font-bold">{record.refId}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Additional Meta</span>
                                <span className="text-foreground">{record.meta}</span>
                            </div>

                            <div className="border-t border-border/80 pt-2 flex justify-between items-center font-bold text-sm">
                                <span>Total Amount</span>
                                <span className="font-serif text-primary">
                                    {record.amount ? `₦ ${record.amount.toLocaleString()}` : '₦ 0.00'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* System Audit Footer Callout */}
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Audit trail verified by Brandy Boutique Grand Resort Property System.</span>
                    </div>

                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 border-t border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        <span>Immutable Record</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
                        >
                            <Printer className="w-3.5 h-3.5 text-primary" />
                            <span>Print Receipt</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-xs font-semibold rounded-[var(--radius)] bg-primary text-primary-foreground hover:opacity-95 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ActivityDetailModal;