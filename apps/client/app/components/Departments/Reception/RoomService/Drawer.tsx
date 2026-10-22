import React from 'react';
import { X, User, Clock, Utensils, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ServiceItem {
    name: string;
    qty: number;
    price: number;
}

export interface RoomServiceRecord {
    id: string;
    room: string;
    guest: string;
    guestsCount: number;
    itemsSummary: string;
    items: ServiceItem[];
    type: string;
    status: string;
    time: string;
    date: string;
    specialInstructions?: string;
}

export interface DrawerProps {
    record: RoomServiceRecord | null;
    onClose: () => void;
    onUpdateStatus: (id: string, newStatus: string) => void;
}

export const RoomServiceDrawer: React.FC<DrawerProps> = ({
    record,
    onClose,
    onUpdateStatus,
}) => {
    if (!record) return null;

    const totalAmount = record.items.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <div className="w-full lg:w-96 rounded-xl border border-border bg-card p-5 space-y-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">

                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold font-serif text-foreground">Room Service Request</h3>
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-secondary rounded text-primary">
                                {record.id}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Order audit log & fulfillment timeline</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Guest & Room Details */}
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-serif font-bold text-primary">
                            {record.room}
                        </div>
                        <div>
                            <p className="font-bold text-xs text-foreground">{record.guest}</p>
                            <p className="text-[10px] text-muted-foreground">Room {record.room} • {record.guestsCount} Guests</p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {record.status}
                    </span>
                </div>

                {/* Itemized Order Breakdown */}
                <div className="space-y-2 border-b border-border pb-3">
                    <p className="text-xs font-bold text-foreground">Ordered Items</p>
                    <div className="space-y-1.5">
                        {record.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">{item.name} × {item.qty}</span>
                                <span className="font-serif font-bold text-foreground">₦ {(item.price * item.qty).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="border-t border-border/60 pt-2 flex justify-between items-center font-bold text-xs">
                            <span>Total Bill</span>
                            <span className="font-serif text-primary text-sm">₦ {totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Special Instructions */}
                {record.specialInstructions && (
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 text-xs space-y-1">
                        <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Special Instructions</p>
                        <p className="italic text-foreground">"{record.specialInstructions}"</p>
                    </div>
                )}

            </div>

            {/* Action Controls */}
            <div className="pt-3 border-t border-border space-y-2">
                {record.status !== 'Completed' && record.status !== 'Delivered' && (
                    <button
                        onClick={() => onUpdateStatus(record.id, 'Delivered')}
                        className="w-full py-2.5 text-xs font-semibold rounded-[var(--radius)] bg-primary text-primary-foreground hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Delivered</span>
                    </button>
                )}

                {record.status === 'Delivered' && (
                    <button
                        onClick={() => onUpdateStatus(record.id, 'Completed')}
                        className="w-full py-2.5 text-xs font-semibold rounded-[var(--radius)] bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Completed</span>
                    </button>
                )}
            </div>
        </div>
    );
};