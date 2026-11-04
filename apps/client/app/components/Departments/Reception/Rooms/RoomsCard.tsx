import { Bed, Users } from "lucide-react";
import type { Room, RoomStatus } from "./type";
import { formatNaira } from "./data";

interface RoomCardProps {
    room: Room;
    isSelected: boolean;
    onSelect: (room: Room) => void;
}


export const RoomCard: React.FC<RoomCardProps> = ({ room, isSelected, onSelect }) => {

    const getStatusBadge = (status: RoomStatus) => {
        switch (status) {
            case 'Available':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Occupied':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'Checkout Due':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'Overdue':
                return 'bg-destructive/10 text-destructive border-destructive';
            default:
                return 'bg-secondary text-muted-foreground border-border';
        }
    };



    return (
        <div
            onClick={() => onSelect(room)}
            className={` relative bg-card rounded-xl border p-4 transition-all cursor-pointer shadow-sm hover:shadow-md ${isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                : 'border-border hover:border-primary/50'
                }`}
        >

            <div className="flex items-center justify-between mb-3">
                <span className="text-[17px] font-bold text-foreground">
                    {room.number}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(room.status)}`}>
                    {room.status}
                </span>
            </div>


            <div className="flex gap-3">
                <img
                    src={room.image}
                    alt={room.type}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 bg-secondary"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        {room.guestName ? (
                            <p className="text-[15px] font-bold text-foreground truncate">{room.guestName}</p>
                        ) : (
                            <p className="text-[15px] font-semibold text-brand-success">VACANT</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-0.5">{room.type}</p>
                    </div>

                    <div className="mt-1">
                        <p className="text font-bold text-primary">
                            {formatNaira(room.pricePerNight)}{' '}
                            <span className="text-[13px] font-normal text-muted-foreground">/ night</span>
                        </p>
                    </div>
                </div>


                <div className="flex flex-col items-center justify-center pl-1">
                    <div className="relative ">
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Bed className="w-4 h-4 text-muted-foreground" />
                                {room.bedCount} Bed
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-muted-foreground" />
                                Max <span className="text-[13px]">{room.maxGuests} </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

