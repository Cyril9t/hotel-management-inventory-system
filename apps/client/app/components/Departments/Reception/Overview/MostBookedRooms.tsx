import { useEffect, useState } from "react";
import { BedDouble, Trophy } from "lucide-react";
import { UseMetricCards } from "~/Context/Context";
import { useRooms } from "~/Context/RoomsContext";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { getBookingHistory, type BookingRecord } from "~/services/bookings";

type RoomBookingCount = { roomId: string; number: string; bookings: number };

export function MostBookedRooms() {
    const { api } = UseMetricCards();
    const { rooms } = useRooms();
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        void getBookingHistory(api).then((records) => {
            if (!cancelled) setBookings(records);
        }).catch((reason: unknown) => {
            if (!cancelled) setError(reason instanceof Error ? reason.message : "Booking records could not be loaded.");
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, [api]);

    const roomCounts = new Map<string, RoomBookingCount>();
    for (const booking of bookings) {
        const roomId = booking.roomId;
        const room = rooms.find((candidate) => candidate.id === roomId || candidate._id === roomId);
        const roomNumber = room?.number ?? booking.room?.number ?? roomId;
        const current = roomCounts.get(roomId);
        roomCounts.set(roomId, {
            roomId,
            number: String(roomNumber),
            bookings: (current?.bookings ?? 0) + 1,
        });
    }
    const mostBookedRooms = [...roomCounts.values()]
        .sort((left, right) => right.bookings - left.bookings || left.number.localeCompare(right.number, undefined, { numeric: true }))
        .slice(0, 3);

    return <Card>
        <CardHeader className="flex flex-row items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Trophy className="h-5 w-5" aria-hidden="true" /></span>
            <div>
                <h2 className="text-lg font-semibold text-foreground">Most Booked Rooms</h2>
                <p className="text-sm text-muted-foreground">Ranked by booking records returned by the Bookings API.</p>
            </div>
        </CardHeader>
        <CardContent>
            {loading ? <div role="status" aria-label="Loading booking records" className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>
                : error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>
                : mostBookedRooms.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No booking records are available yet.</p>
                : <ol className="divide-y divide-border">
                    {mostBookedRooms.map((room, index) => <li key={room.roomId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-muted-foreground">{index + 1}</span>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><BedDouble className="h-4 w-4" aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">Room {room.number}</p>
                            <p className="text-xs text-muted-foreground">Booking records</p>
                        </div>
                        <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold tabular-nums text-foreground">{room.bookings}</span>
                    </li>)}
                </ol>}
        </CardContent>
    </Card>;
}
