import { LogIn, LogOut, UtensilsCrossed } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

interface ActivityItem {
    id: number;
    room: string;
    action: string;
    time: string;
    detail: string;
    type: 'checkin' | 'service' | 'checkout';
}

export const RecentActivityFeed: React.FC = () => {
    const activities: ActivityItem[] = [
        {
            id: 1,
            room: 'Room 204',
            action: 'Check-in',
            time: '10:42 PM',
            detail: 'John Smith',
            type: 'checkin',
        },
        {
            id: 2,
            room: 'Room 312',
            action: 'Room Service',
            time: '10:21 PM',
            detail: 'Burger, Fries, Coke',
            type: 'service',
        },
        {
            id: 3,
            room: 'Room 110',
            action: 'Check-out',
            time: '09:54 PM',
            detail: 'Sarah Wilson',
            type: 'checkout',
        },
    ];

    return (
        <Card >

            <CardHeader>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
                    <span className="text-[10px] font-semibold  uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                        Live Feed
                    </span>
                </div>
            </CardHeader>


            <CardContent>

                <div className="space-y-3">
                    {activities.map((act) => (
                        <div
                            key={act.id}
                            className="flex items-center justify-between p-3.5 rounded-[var(--radius)] bg-secondary/30 border border-border/50 hover:bg-secondary/60 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Button className={` h-10 w-10 ${act.type === 'checkin'
                                    ? 'bg-brand-success/15 text-brand-success'
                                    : act.type === 'service'
                                        ? 'bg-brand-gold/15 text-brand-gold'
                                        : 'bg-destructive/15 text-destructive'
                                    }`}>
                                    {act.type === 'checkin' ? <LogIn className="w-4 h-4" /> : act.type === 'service' ? <UtensilsCrossed className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                                </Button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[15px] font-bold text-foreground">{act.room}</span>
                                        <span className="text-sm font-semibold text-primary">{act.action}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {act.time} • {act.detail}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};