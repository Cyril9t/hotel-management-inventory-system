import { BedDouble, CalendarIcon, ChevronDown, DollarSign, Download, Hotel, House, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { useRooms } from "~/Context/RoomsContext";
import { formatReceptionCurrency, useReceptionRevenue } from "~/Context/ReceptionRevenueContext";

export function MetricCards({ user = "" }) {

    const { counts } = useRooms()
    const { period, setPeriod, total, loading: revenueLoading, error: revenueError, retry } = useReceptionRevenue();
    const tabs = ['Today', 'Week', 'Month', 'Year'];

    const CARDS = [
        {
            title: "Reception Revenue",
            icons: <DollarSign className="w-4 h-4 text-primary" />,
            figure: revenueLoading ? "Loading…" : revenueError ? "Unavailable" : formatReceptionCurrency(total)
        },
        {
            title: "Occupancy Rate",
            icons: <BedDouble className="w-4 h-4 text-primary" />,
            figure: counts.occupied
        },
        {
            title: "Active Staff",
            icons: <Users className="w-4 h-4 text-primary" />,
            figure: 24
        }
    ]

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{user} Dashboard</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time consolidated yield, turnover metrics, and asset occupancy performance.</p>
                </div>

                <div className="flex items-center gap-3">

                    <div className="flex items-center bg-secondary p-1 rounded-xl border border-border">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setPeriod(tab === "Today" ? "daily" : tab === "Week" ? "weekly" : tab === "Month" ? "monthly" : "yearly");
                                }}
                                aria-pressed={period === (tab === "Today" ? "daily" : tab === "Week" ? "weekly" : tab === "Month" ? "monthly" : "yearly")}
                                className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${period === (tab === "Today" ? "daily" : tab === "Week" ? "weekly" : tab === "Month" ? "monthly" : "yearly")
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>


                    <Button variant={"outline"} className="flex items-center gap-2 h-10">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                        <span>{new Date().toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        })}</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>


                    <Button variant={"default"} className="flex items-center gap-2 h-10">
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Folio</span>
                    </Button>
                </div>
            </div>


            <div className="flex gap-3">
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Rooms</span>
                            <div className="p-2 rounded-lg bg-accent text-accent-foreground">
                                <House className="w-4 h-4 text-primary" />
                            </div>
                        </div>


                    </CardHeader>

                    <CardContent>
                        <CardDescription >
                            <div className="">
                                <h3 className="text-2xl font-bold text-foreground">
                                    {counts.total}
                                </h3>
                            </div>
                        </CardDescription>
                    </CardContent>
                </Card>
                {CARDS.map((card) => {
                    return (
                        <Card key={card.title} className="w-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
                                    <div className="p-2 rounded-lg bg-accent text-accent-foreground">
                                        {card.icons}
                                    </div>
                                </div>


                            </CardHeader>

                            <CardContent>
                                <CardDescription >
                                    <div className="">
                                        <h3 className="text-2xl font-bold text-foreground">{card.figure}</h3>
                                        {card.title === "Reception Revenue" && revenueError && <div className="mt-2 flex items-center gap-2 text-xs text-destructive"><span>{revenueError}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>}
                                    </div>
                                </CardDescription>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
