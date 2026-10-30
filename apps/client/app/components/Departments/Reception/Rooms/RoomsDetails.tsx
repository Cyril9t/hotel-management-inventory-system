import { Bed, Calendar, LogOut, Mail, Phone, Plus, Sparkles, Tv, Users, UtensilsCrossed, Wifi, Wind } from "lucide-react";
import type { Room } from "./type";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface RoomDetailsDrawerProps {
    room: Room | null;
    onCheckOut?: (room: Room) => void;
    onOrderService?: (room: Room) => void;
    onBookNow?: (room: Room) => void;
    onCreateRoom?: () => void;
    action: boolean;
}

export const RoomDetailsDrawer: React.FC<RoomDetailsDrawerProps> = ({
    room,
    onCheckOut,
    onOrderService,
    onBookNow,
    onCreateRoom,
    action,
}) => {
    if (!room) {
        return (
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <Bed className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <h4 className="text-sm font-bold text-foreground">No Room Selected</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Click on any room card from the list to view detailed guest information and quick actions.
                </p>
                {action && onCreateRoom && <Button onClick={onCreateRoom} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create room</Button>}
            </div>
        );
    }

    const isOccupied = room.status === 'Occupied' || room.status === 'Checkout Due' || room.status === 'Overdue';

    const formatNaira = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card className=" sticky top-6">

            <CardHeader>

                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <div className="flex items-center gap-2">

                            <h3 className="text-[17px] font-bold text-foreground">Room {room.number}</h3>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${room.status === 'Available'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                }`}>
                                {room.status}
                            </span>
                        </div>
                        <p className=" text-sm text-muted-foreground mt-0.5">
                            {room.type} • {room.floor} • {room.wing}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="relative rounded-lg overflow-hidden h-36 bg-secondary">
                    <img src={room.image} alt={room.type} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-primary shadow-sm">
                        {formatNaira(room.pricePerNight)} <span className="text-[10px] font-normal text-muted-foreground">/ night</span>
                    </div>
                </div>


                {isOccupied && room.guestName ? (
                    <div className="space-y-3 pt-1 mt-3">
                        <h4 className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest">
                            Guest Information
                        </h4>

                        <div className="space-y-2 text-sm">

                            <div className="flex items-center gap-2 text-foreground font-semibold">

                                <Users className="w-3.5 h-3.5 text-primary" />

                                <span className="tracking-wider">{room.guestName}</span>
                                {room.guestGender && (
                                    <span className="text-[10px] tracking-widest font-bold text-muted-foreground">({room.guestGender})</span>
                                )}
                            </div>

                            {room.guestPhone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5 text-primary" />
                                    <span>{room.guestPhone}</span>
                                </div>
                            )}

                            {room.guestEmail && (
                                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                                    <Mail className="w-3.5 h-3.5 text-primary" />
                                    <span className="tracking-wider">{room.guestEmail}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : room.status === 'Available' ? (
                    <div className="p-3 rounded-lg bg-brand-success/10 border border-brand-success text-xs text-brand-success mt-2 mb-2 font-medium">
                        ✨ This room is currently vacant and ready for guest check-in.
                    </div>
                ) : (
                    <div className="p-3 rounded-lg bg-secondary text-xs text-muted-foreground mt-2 mb-2 font-medium">
                        This room has an active booking. Guest details are not included in the Rooms API response.
                    </div>
                )}


                {isOccupied && room.stayStartDate && (
                    <div className="mb-3 pt-3 border-t border-border space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-muted-foreground uppercase tracking-widest text-[13px]">Stay Duration</span>
                            <span className="font-bold text-foreground">{room.stayNights} nights</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm bg-secondary/50 p-2.5 rounded-lg border border-border/50">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{room.stayStartDate} – {room.stayEndDate}</span>
                        </div>
                    </div>
                )}

                <div className="pt-3 border-t border-border space-y-2">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                        Room Features
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-foreground">
                        <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-primary" /> WiFi</span>
                        <span className="flex items-center gap-1.5"><Tv className="w-3.5 h-3.5 text-primary" /> TV</span>
                        <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-primary" /> AC</span>
                    </div>
                </div>

                {action && (
                    <div className="mt-3 pt-4 border-t border-border space-y-2">
                        {onCreateRoom && <Button variant="outline" onClick={onCreateRoom} className="w-full h-10"><Plus className="w-4 h-4" /><span>Create room</span></Button>}
                        {isOccupied ? (
                            <>
                                <Button
                                    variant={"destructive"}
                                    onClick={() => onCheckOut?.(room)}
                                    className="w-full h-10"
                                >
                                    <LogOut className="w-4 h-4 text-destructive" />
                                    <span>Check Out Guest</span>
                                </Button>

                                <Button
                                    variant={"secondary"}
                                    onClick={() => onOrderService?.(room)}
                                    className="w-full h-10"
                                >
                                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                                    <span>Order Room Service</span>
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => onBookNow?.(room)}
                                className="w-full h-11"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Book Room Now</span>
                            </Button>
                        )}
                    </div>
                )}


            </CardContent>
        </Card>
    );
};

