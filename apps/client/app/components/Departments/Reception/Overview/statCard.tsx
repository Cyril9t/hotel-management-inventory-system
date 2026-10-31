import { BedDouble, CircleHelp } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { UseMetricCards } from "~/Context/Context";

function displayStatus(status: string) {
    return status.toLowerCase().split("_").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

export const StatListCard = () => {
    const { counts, roomsLoading, roomsError, rooms } = UseMetricCards();

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Rooms by status</h2>
            {roomsLoading ? <div role="status" aria-label="Loading room statuses" className="space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div> : roomsError ? (
                <Card><CardContent className="p-5 text-sm text-destructive">Room status data could not be loaded.</CardContent></Card>
            ) : rooms.length === 0 ? (
                <Card><CardContent className="p-5 text-sm text-muted-foreground">No rooms have been returned by the Rooms API.</CardContent></Card>
            ) : Object.entries(counts.byStatus as Record<string, number>).map(([status, count]) => (
                <Card key={status}>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        {status === "UNKNOWN" ? <CircleHelp className="h-4 w-4 text-muted-foreground" /> : <BedDouble className="h-4 w-4 text-primary" />}
                        <h3 className="text-[15px] font-medium">{displayStatus(status)}</h3>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-foreground">{count} <span className="text-base font-normal text-muted-foreground">{count === 1 ? "room" : "rooms"}</span></p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
