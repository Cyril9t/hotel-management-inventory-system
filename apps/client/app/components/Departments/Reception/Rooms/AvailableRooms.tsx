import { useMemo, useState } from "react";
import { RoomOccupancyHeader } from "./Header";
import { RoomFiltersBar } from "./RoomFilter";
import { RoomCard } from "./RoomsCard";
import { RoomDetailsDrawer } from "./RoomsDetails";
import type { Room } from "./type";
import { INITIAL_ROOMS } from "./data";
import BookRoomModal from "./BookRoom/BookGuest";

export default function AvailableRoomsPage() {
    const [rooms] = useState<Room[]>(INITIAL_ROOMS);

    const [searchTerm, setSearchTerm] = useState('');

    const [selectedStatus, setSelectedStatus] = useState('All');

    const [selectedType, setSelectedType] = useState('All');

    const [bookRooms, setBookRooms] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(INITIAL_ROOMS[1]);

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

    const counts = useMemo(() => {
        return {
            total: rooms.length,

            available: rooms.filter((r) => r.status === 'Available').length,
            occupied: rooms.filter((r) => r.status === 'Occupied').length,
            checkoutDue: rooms.filter((r) => r.status === 'Checkout Due').length,
            overdue: rooms.filter((r) => r.status === 'Overdue').length,
        };
    }, [rooms]);

    return (
        <div >

            <BookRoomModal
                isOpen={bookRooms}
                room={selectedRoom as unknown as Parameters<typeof BookRoomModal>[0]["room"]}
                onClose={() => {
                    console.log(selectedRoom)
                    setBookRooms(false)
                }}
            />
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-foreground tracking-wide">Available Rooms</h1>

                <p className="text text-muted-foreground mt-1">
                    Monitor real-time room occupancy, availability, and guest stay details.
                </p>
            </div>


            <RoomOccupancyHeader rooms={rooms} />


            <RoomFiltersBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                totalCount={counts.total}
                availableCount={counts.available}
                occupiedCount={counts.occupied}
                checkoutDueCount={counts.checkoutDue}
                overdueCount={counts.overdue}
                onNewBooking={() => {

                    setBookRooms(true)
                }}
            />



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-7">
                <div className="lg:col-span-8 space-y-4">
                    {filteredRooms.length > 0 ? (
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
                    />
                </div>
            </div>
        </div>
    );
}