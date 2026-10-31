import { useEffect, useMemo, useRef, useState } from "react";
import { RoomOccupancyHeader } from "./Header";
import { RoomFiltersBar } from "./RoomFilter";
import { RoomCard } from "./RoomsCard";
import { RoomDetailsDrawer } from "./RoomsDetails";
import type { ApiRoom, Room } from "./type";
import { UseMetricCards } from "~/Context/Context";
import BookRoomModal from "./BookRoom/BookGuest";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

const roomImages = [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
];

function mapApiRoom(room: ApiRoom, index: number,): Room {
    const statusByApiValue: Record<string, Room["status"]> = {
        AVAILABLE: "Available",
        RESERVED: "Occupied",
        CHECKED_IN: "Occupied",
        OCCUPIED: "Occupied",
        CHECKOUT_DUE: "Checkout Due",
        OVERDUE: "Overdue",
    };
    const apiStatus = String(room.status ?? "UNKNOWN").trim();
    const normalizedStatus = apiStatus.toUpperCase().replace(/[ _-]+/g, "_");
    const status = statusByApiValue[normalizedStatus] ?? apiStatus.toLowerCase().split(/[ _-]+/).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
    const number = String(room.number ?? "");
    return {
        id: String(room.id ?? room._id ?? number),
        number,
        type: String(room.category?.name ?? room.type ?? "Room") as Room["type"],
        pricePerNight: Number(room.category?.pricePerNight ?? room.category?.price_per_night ?? room.pricePerNight ?? 0),
        bedCount: 1,
        maxGuests: 2,
        status,
        occupancyProgress: normalizedStatus === "AVAILABLE" ? 0 : 100,
        floor: number.length > 1 ? `Floor ${number.slice(0, -2) || "1"}` : undefined,
        wing: "",
        image: roomImages[index % roomImages.length],
    };
}

export default function AvailableRoomsPage({ onCreateRoom, refreshKey = 0, allowRoomActions = true, }: { onCreateRoom?: () => void; refreshKey?: number; allowRoomActions?: boolean; } = {}) {

    const { api, rooms: apiRooms, roomsLoading, roomsError, refreshRooms } = UseMetricCards();
    const rooms = useMemo(() => apiRooms.map(mapApiRoom), [apiRooms]);

    const [searchTerm, setSearchTerm] = useState('');

    const [selectedStatus, setSelectedStatus] = useState('All');

    const [selectedType, setSelectedType] = useState('All');

    const [bookRooms, setBookRooms] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    useEffect(() => {
        setSelectedRoom((current) => rooms.find((room: any) => room.id === current?.id) ?? rooms[0] ?? null);
    }, [rooms]);

    const lastRefreshKey = useRef(refreshKey);
    useEffect(() => {
        if (lastRefreshKey.current === refreshKey) return;
        lastRefreshKey.current = refreshKey;
        void refreshRooms().catch(() => { });
    }, [refreshKey, refreshRooms]);

    const roomCounts = useMemo(() => {
        const available = rooms.filter((room: any) => room.status === "Available").length;
        const checkoutDue = rooms.filter((room: any) => room.status === "Checkout Due").length;
        const overdue = rooms.filter((room: any) => room.status === "Overdue").length;
        return { total: rooms.length, available, occupied: rooms.length - available, checkoutDue, overdue };
    }, [rooms]);
    const roomTypes = useMemo<string[]>(() => Array.from(new Set(rooms.map((room: any) => String(room.type)))), [rooms]);

    const filteredRooms = useMemo(() => {
        return rooms.filter((room: any) => {
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
                api={api}
                isOpen={bookRooms}
                room={selectedRoom as unknown as Parameters<typeof BookRoomModal>[0]["room"]}
                onBookingComplete={() => { void refreshRooms().catch(() => { }); }}
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
                            {filteredRooms.map((room: any) => (
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
                        action={allowRoomActions}
                    />
                </div>
            </div>
        </div>
    );
}
