
import { History, Download } from 'lucide-react';
import { Button } from '~/components/ui/button';

export const ReceptionHistoryHeader = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
                <div className="flex items-center gap-2">
                    <History className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">
                        Front Desk Activity History
                    </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive audit log for all reception events, check-ins, payments, and shift handovers.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Button variant={"outline"} className="h-10 ">
                    <Download className="w-4 h-4 text-primary" />
                    Export Audit Report (CSV)
                </Button>
            </div>
        </div>
    );
};