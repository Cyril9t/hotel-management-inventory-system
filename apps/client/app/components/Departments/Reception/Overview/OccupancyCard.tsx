import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { UseMetricCards } from "~/Context/Context";
import ReceptionRadialBar from "../../Shared/RedalBar";

export const OccupancyCard = () => {
    const { counts, roomsLoading, roomsError, rooms } = UseMetricCards();
    return (
        <div className="flex h-full flex-col gap-7.5">
            <div className="mb-4 flex items-center justify-between">
                <span className="text-xl font-bold uppercase tracking-wider">ROOM OCCUPANCY &amp; OVERVIEW</span>
                <span className="text-xl font-medium text-muted-foreground">{roomsLoading ? "Loading rooms…" : `Total ${counts.total} Rooms`}</span>
            </div>

            {roomsLoading ? <div role="status" aria-label="Loading room occupancy" className="h-32 animate-pulse rounded-xl bg-muted" /> : roomsError ? (
                <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Room occupancy could not be loaded.</p>
            ) : rooms.length === 0 ? (
                <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">No rooms have been returned by the Rooms API.</p>
            ) : <ReceptionRadialBar />}

            <div className="flex w-full gap-3 border-t border-border pt-4">
                <Card className="w-full">
                    <CardHeader><h2 className="text-[12px] font-bold uppercase tracking-widest">Available Rooms</h2></CardHeader>
                    <CardContent><p className="mt-0.5 font-serif text-3xl font-bold text-brand-success">{roomsLoading ? "—" : counts.available}</p></CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader><h2 className="text-[12px] font-bold uppercase tracking-widest">Occupied Rooms</h2></CardHeader>
                    <CardContent><p className="mt-0.5 font-serif text-3xl font-bold text-destructive">{roomsLoading ? "—" : counts.occupied}</p></CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader><h2 className="text-[12px] font-bold uppercase tracking-widest">Checkout Due</h2></CardHeader>
                    <CardContent><p className="mt-0.5 font-serif text-3xl font-bold text-brand-gold">{roomsLoading ? "—" : counts.checkoutDue}</p></CardContent>
                </Card>
            </div>
        </div>
    );
};
