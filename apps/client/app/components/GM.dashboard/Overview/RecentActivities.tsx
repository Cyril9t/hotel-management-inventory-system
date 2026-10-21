import { Bed, ChefHat, ChevronRight, Clock, Download, FileSpreadsheet, Key, PackageCheck } from "lucide-react";

export function RecentActivitiesAndActions() {
    const activities = [
        {
            id: 1,
            icon: Bed,
            title: 'New booking • Room 312',
            tag: 'David Bello',
            detail: 'Executive Deluxe Suite • Confirmed via Reception Desk',
            time: '10:42 PM',
            dept: 'Reception',
        },
        {
            id: 2,
            icon: PackageCheck,
            title: 'Stock received • Food Items',
            tag: 'Storekeeper',
            detail: 'Central pantry restock • 14 items cataloged & logged',
            time: '10:21 PM',
            dept: 'Store',
        },
        {
            id: 3,
            icon: ChefHat,
            title: 'Order ready • Table 4',
            tag: 'Chef Vance',
            detail: 'Main course dispatch • Expedited room delivery service',
            time: '10:15 PM',
            dept: 'Kitchen',
        },
    ];

    return (
        <div className="space-y-6">

            <div className="bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">Recent Activities</h3>
                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded">
                            GM Audit Feed
                        </span>
                    </div>
                    <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {activities.map((act) => {
                        const Icon = act.icon;
                        return (
                            <div key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors border border-border/40">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-2.5 rounded-lg bg-secondary text-primary">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-foreground">{act.title}</p>
                                            <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                                                {act.tag}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{act.detail}</p>
                                    </div>
                                </div>

                                <div className="text-right text-[11px]">
                                    <span className="text-muted-foreground">{act.time}</span>
                                    <span className="text-muted-foreground font-light"> • </span>
                                    <span className="font-semibold text-foreground">{act.dept}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Action Banner Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Folio Audit */}
                <div className="bg-card border border-border rounded-[var(--radius)] p-4 flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-secondary text-primary">
                            <Key className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-foreground">Master Folio Audit</h4>
                            <p className="text-[11px] text-muted-foreground">3 pending settlements</p>
                        </div>
                    </div>
                    <div className="p-1.5 rounded-md bg-secondary text-muted-foreground group-hover:text-foreground transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Kitchen Bottlenecks */}
                <div className="bg-card border border-border rounded-[var(--radius)] p-4 flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-secondary text-primary">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-foreground">Kitchen Bottlenecks</h4>
                            <p className="text-[11px] text-muted-foreground">Prep SLA at 14m (Optimal)</p>
                        </div>
                    </div>
                    <div className="p-1.5 rounded-md bg-secondary text-muted-foreground group-hover:text-foreground transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Daily Report Export */}
                <div className="bg-card border border-border rounded-[var(--radius)] p-4 flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-secondary text-primary">
                            <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-foreground">Daily Owner Report</h4>
                            <p className="text-[11px] text-muted-foreground">Ready for export (PDF)</p>
                        </div>
                    </div>
                    <button className="p-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}