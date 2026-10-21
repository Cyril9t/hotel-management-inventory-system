
import { History, Download } from 'lucide-react';

export const ReceptionHistoryHeader = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
                <div className="flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold font-serif text-foreground">
                        Front Desk Activity History
                    </h1>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Comprehensive audit log for all reception events, check-ins, payments, and shift handovers.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground flex items-center gap-2 transition-colors">
                    <Download className="w-4 h-4 text-primary" />
                    Export Audit Report (CSV)
                </button>
            </div>
        </div>
    );
};