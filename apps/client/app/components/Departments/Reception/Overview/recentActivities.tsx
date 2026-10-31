import { BedDouble } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { UseMetricCards } from "~/Context/Context";

function formatStatus(status?: string) {
    return status?.toLowerCase().split(/[_ -]+/).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ") || "Status unavailable";
}

export const RecentActivityFeed = () => {
    const { rooms, roomsLoading, roomsError } = UseMetricCards();

    return (
        <Card>
            <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">Rooms</h3>
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Live from API</span>
                </div>
            </CardHeader>
            <CardContent>
                {roomsLoading ? <div role="status" aria-label="Loading rooms" className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div> : roomsError ? (
                    <p role="alert" className="text-sm text-destructive">Room information could not be loaded.</p>
                ) : rooms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No rooms are available to display.</p>
                ) : (
                    <div className="space-y-3">
                        {rooms.slice(0, 5).map((room, index) => (
                            <div key={room.id ?? room._id ?? `${room.number ?? "room"}-${index}`} className="flex items-center justify-between rounded-[var(--radius)] border border-border/50 bg-secondary/30 p-3.5">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><BedDouble className="h-4 w-4" /></span>
                                    <div>
                                        <p className="text-[15px] font-bold text-foreground">Room {room.number ?? "—"}</p>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground">{room.category?.name ?? room.type ?? "Category unavailable"}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-primary">{formatStatus(room.status)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
