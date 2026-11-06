import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Button } from '~/components/ui/button';

export interface LedgerItem {
    id: string;
    name: string;
    department: string;
    mainStore: string;
    issuedToDept: string;
    availableInDept: string;
    status: 'OK' | 'Low' | 'Critical';
}

export interface LedgerTableProps {
    items: LedgerItem[];
    onReceiveItem: (item: LedgerItem) => void;
    onIssueItem: (item: LedgerItem) => void;
    onViewAllLedger?: () => void;
}

export const DepartmentStockLedgerTable: React.FC<LedgerTableProps> = ({
    items,
    onReceiveItem,
    onIssueItem,
    onViewAllLedger,
}) => {

    const getStatusBadge = (status: LedgerItem['status']) => {
        switch (status) {

            case 'OK':
                return 'bg-brand-success/10 text-brand-success border-emerald-500/30';
            case 'Low':
                return 'bg-destructive/10 text-destructive border-amber-500/30';
            default:
                return 'bg-secondary text-muted-foreground';

        }
    };

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col justify-between">


            <div className="p-5 border-b border-border flex items-center justify-between bg-brand-navy ">
                <div>
                    <h3 className="text-2xl font-bold text-amber-50">Department Stock & Ledger</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Inventory distribution across main store and operational departments
                    </p>
                </div>
                <span className="px-2.5 py-1 text-sm text-primary rounded-md border border-border">
                    {items.length} Active Ledger Items
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-center text-[14px]">
                    <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-semibold uppercase tracking-wider text-[15px]">
                        <tr>
                            <th className="p-3.5 pl-4">Items</th>
                            <th className="p-3.5">Department</th>
                            <th className="p-3.5">Main Store</th>

                            <th className="p-3.5">Available in Dept</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 pr-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-secondary/20 transition-colors">

                                <td className="p-3.5 pl-4 ">
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-bold text-foreground">{item.name}</h1>
                                    </div>
                                </td>

                                <td className="p-3.5 text-muted-foreground font-semibold">
                                    {item.department}
                                </td>


                                <td className="p-3.5   font-bold text-foreground">
                                    {item.mainStore}
                                </td>

                                <td className="p-3.5  font-bold text-primary">
                                    {item.availableInDept}
                                </td>


                                <td className="p-3.5">
                                    <Button className={`text-[11px] font-bold ${getStatusBadge(item.status)}`}>
                                        {item.status}
                                    </Button>
                                </td>


                                <td className="p-3.5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant={"outline"}
                                            onClick={() => onReceiveItem(item)}
                                            className=""
                                        >
                                            <ArrowDownLeft className="w-3 h-3 text-brand-success" />
                                            <span>Receive</span>
                                        </Button>

                                        <Button
                                            onClick={() => onIssueItem(item)}
                                            className=""
                                        >
                                            <ArrowUpRight className="w-3 h-3" />
                                            <span>Issue</span>
                                        </Button>
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Link */}
            <div className="p-3.5 border-t border-border bg-card text-center">
                <button
                    onClick={onViewAllLedger}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-all"
                >
                    <span>View all ledger transactions & stock movements</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

        </div>
    );
};