import { useEffect, useMemo, useState } from "react";
import { RoomOccupancyHeader } from "./Header";
import { RoomFiltersBar } from "./RoomFilter";
import { RoomCard } from "./RoomsCard";
import { RoomDetailsDrawer } from "./RoomsDetails";
import type { Room } from "./type";
import { UseMetricCards } from "~/Context/Context";
import BookRoomModal from "./BookRoom/BookGuest";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

const roomImages = [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
];

function mapApiRoom(room: any, index: number,): Room {
    const statusByApiValue: Record<string, Room["status"]> = {
        AVAILABLE: "Available",
        RESERVED: "Occupied",
        CHECKED_IN: "Occupied",
        OCCUPIED: "Occupied",
        CHECKOUT_DUE: "Checkout Due",
        OVERDUE: "Overdue",
    };
    const status = statusByApiValue[String(room.status ?? "AVAILABLE").toUpperCase()] ?? "Available";
    const number = String(room.number ?? "");
    return {
        id: String(room.id ?? room._id ?? number),
        number,
        type: String(room.category?.name ?? room.type ?? "Room") as Room["type"],
        pricePerNight: Number(room.category?.pricePerNight ?? room.category?.price_per_night ?? room.pricePerNight ?? 0),
        bedCount: 1,
        maxGuests: 2,
        status,
        occupancyProgress: status === "Available" ? 0 : 100,
        floor: number.length > 1 ? `Floor ${number.slice(0, -2) || "1"}` : undefined,
        wing: "",
        image: roomImages[index % roomImages.length],
    };
}

export default function AvailableRoomsPage({ onCreateRoom, refreshKey = 0, }: { onCreateRoom?: () => void; refreshKey?: number; } = {}, action: true) {

    const { api } = UseMetricCards();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [roomsError, setRoomsError] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const [selectedStatus, setSelectedStatus] = useState('All');

    const [selectedType, setSelectedType] = useState('All');

    const [bookRooms, setBookRooms] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    useEffect(() => {
        let cancelled = false;
        setRoomsLoading(true);
        setRoomsError(false);
        void api.get("/rooms", { params: { isActive: true } }).then((response: any) => {
            console.log("Rooms API response:", response.data);
            const payload = response.data?.data?.rooms ?? response.data?.data ?? response.data?.rooms ?? [];
            const nextRooms = (Array.isArray(payload) ? payload : []).map(mapApiRoom);
            if (!cancelled) {
                setRooms(nextRooms);
                setSelectedRoom((current) => nextRooms.find((room) => room.id === current?.id) ?? nextRooms[0] ?? null);
            }
        }).catch((error: any) => {
            console.error("Failed to load rooms:", error);
            if (!cancelled) setRoomsError(true);
        }).finally(() => {
            if (!cancelled) setRoomsLoading(false);
        });
        return () => { cancelled = true; };
    }, [api, refreshKey]);

    const roomCounts = useMemo(() => {
        const available = rooms.filter((room) => room.status === "Available").length;
        const checkoutDue = rooms.filter((room) => room.status === "Checkout Due").length;
        const overdue = rooms.filter((room) => room.status === "Overdue").length;
        return { total: rooms.length, available, occupied: rooms.length - available, checkoutDue, overdue };
    }, [rooms]);
    const roomTypes = useMemo(() => Array.from(new Set(rooms.map((room) => room.type))), [rooms]);

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const matchesSearch =
                room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (room.guestName && room.guestName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                room.type.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = selectedStatus === 'All' || room.status === selectedStatus;
            const matchesType = selectedType === 'All' || room.type === selectedType;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [rooms, searchTerm, selectedStatus, selectedType]);


    return (
        <div >

            <BookRoomModal
                isOpen={bookRooms}
                room={selectedRoom as unknown as Parameters<typeof BookRoomModal>[0]["room"]}
                onClose={() => {
                    setBookRooms(false)
                }}
            />
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-wide">Available Rooms</h1>

                    <p className="text text-muted-foreground mt-1">
                        Monitor real-time room occupancy, availability, and guest stay details.
                    </p>
                </div>
                {onCreateRoom && <Button onClick={onCreateRoom} className="gap-2"><Plus className="h-4 w-4" />Create room</Button>}
            </div>


            <RoomOccupancyHeader rooms={rooms} />


            <RoomFiltersBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                totalCount={roomCounts.total}
                availableCount={roomCounts.available}
                occupiedCount={roomCounts.occupied}
                checkoutDueCount={roomCounts.checkoutDue}
                overdueCount={roomCounts.overdue}
                roomTypes={roomTypes}
                onNewBooking={() => {

                    setBookRooms(true)
                }}
            />



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-7">
                <div className="lg:col-span-8 space-y-4">
                    {roomsLoading ? <div role="status" className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">Loading rooms…</div> : roomsError ? <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-12 text-center text-sm text-muted-foreground">Could not load rooms from the Rooms API. Try reopening this department.</div> : filteredRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredRooms.map((room) => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    isSelected={selectedRoom?.id === room.id}
                                    onSelect={(r) => setSelectedRoom(r)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                            <p className="text-sm font-semibold text-foreground">No rooms found</p>
                            <p className="text-xs mt-1">Try adjusting your search criteria or filter options.</p>
                        </div>
                    )}
                </div>


                <div className="lg:col-span-4">
                    <RoomDetailsDrawer
                        room={selectedRoom}
                        onCheckOut={(r) => alert(`Checking out room ${r.number}`)}
                        onOrderService={(r) => alert(`Ordering room service for room ${r.number}`)}
                        onBookNow={(r) => setBookRooms(true)}
                        action={action}
                    />
                </div>
            </div>
        </div>
    );
}
