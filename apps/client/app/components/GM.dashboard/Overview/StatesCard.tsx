import { ArrowUpRight, Banknote, Bed, Users, UtensilsCrossed } from "lucide-react";

export function StatCards() {
    const stats = [
        {
            title: 'TOTAL ROOMS',
            value: '50',
            subtitle: '82% occupancy',
            icon: Bed,
            badgeColor: 'text-muted-foreground',
        },
        {
            title: "TODAY'S REVENUE",
            value: '₦ 1,245,000',
            subtitle: 'vs yesterday',
            trend: '12%',
            icon: Banknote,
            badgeColor: 'text-brand-gold',
        },
        {
            title: 'TOTAL ORDERS',
            value: '48',
            subtitle: 'volume pace',
            trend: '8%',
            icon: UtensilsCrossed,
            badgeColor: 'text-brand-gold',
        },
        {
            title: 'ACTIVE STAFF',
            value: '24',
            subtitle: 'On duty • Shift 1',
            icon: Users,
            badgeColor: 'text-brand-gold',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                    <div
                        key={idx}
                        className="bg-card border border-border rounded-[var(--radius)] p-5 shadow-sm flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {stat.title}
                            </span>
                            <div className="p-2 rounded-lg bg-secondary text-primary">
                                <IconComponent className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="my-3">
                            <h3 className="text-2xl font-bold font-serif text-foreground">{stat.value}</h3>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {stat.trend && (
                                <span className="flex items-center font-bold text-primary gap-0.5">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    {stat.trend}
                                </span>
                            )}
                            <span>{stat.subtitle}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}