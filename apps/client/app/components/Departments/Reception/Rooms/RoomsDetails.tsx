import { useEffect, useRef, useState } from "react";
import { Bed, Calendar, LogOut, Phone, Plus, Sparkles, Tv, Users, UtensilsCrossed, Wifi, Wind } from "lucide-react";
import type { Room } from "./type";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { toast } from "sonner";
import { UseMetricCards } from "~/Context/Context";
import { useRooms } from "~/Context/RoomsContext";
import { checkoutBooking, getBookingDetails, getBookingsForRoom, type BookingRecord, type BookingSummary } from "~/services/bookings";
import { formatNaira } from "./data";

interface RoomDetailsDrawerProps {
    room: Room | null;
    bookingRefreshKey?: number;
    onOrderService?: (room: Room) => void;
    onBookNow?: (room: Room) => void;
    onCreateRoom?: () => void;
    action: boolean;
}

const checkoutEligibleStatuses = ["CHECKED_IN", "CHECKOUT_DUE", "OVERDUE"] as const;

function isCheckoutEligible(booking: { status?: string }) {
    return booking.status !== undefined && checkoutEligibleStatuses.includes(booking.status as (typeof checkoutEligibleStatuses)[number]);
}

function guestName(booking: Pick<BookingSummary, "guestFirstName" | "guestLastName">) {
    return [booking.guestFirstName, booking.guestLastName].filter((name): name is string => Boolean(name)).join(" ") || "Guest name unavailable";
}

function formatDateTime(value?: string | null) {
    if (!value) return "Not recorded";
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function formatBookingPrice(value?: string) {
    const amount = Number(value);
    return Number.isFinite(amount) ? formatNaira(amount) : "Unavailable";
}

function bookingStatusLabel(status?: string) {
    return status ?? "Status unavailable";
}

function checkoutErrorMessage(error: any) {
    const status = error?.response?.status;
    const apiMessage = error?.response?.data?.error?.message;
    if (status === 400) {
        if (typeof apiMessage === "string" && apiMessage !== "Bad request") return apiMessage;
        return "Checkout was not completed. The booking may no longer be eligible or may have unpaid charge-to-room sales.";
    }
    if (status === 404) return "This booking could not be found. Refresh the booking information before trying again.";
    return apiMessage ?? error?.message ?? "Could not check out this guest. Please try again.";
}

export const RoomDetailsDrawer: React.FC<RoomDetailsDrawerProps> = ({
    room,
    bookingRefreshKey = 0,
    onOrderService,
    onBookNow,
    onCreateRoom,
    action,
}) => {
    const { api } = UseMetricCards();
    const { refreshRooms } = useRooms();
    const [roomBookings, setRoomBookings] = useState<Awaited<ReturnType<typeof getBookingsForRoom>>>([]);
    const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingsError, setBookingsError] = useState("");
    const [bookingRetryKey, setBookingRetryKey] = useState(0);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [bookingDetails, setBookingDetails] = useState<BookingRecord | null>(null);
    const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);
    const [bookingDetailsError, setBookingDetailsError] = useState("");
    const [bookingDetailsRetryKey, setBookingDetailsRetryKey] = useState(0);
    const [completedCheckout, setCompletedCheckout] = useState<BookingRecord | null>(null);
    const [roomRefreshError, setRoomRefreshError] = useState<{ roomId: string; message: string } | null>(null);
    const [confirmationBooking, setConfirmationBooking] = useState<BookingSummary | null>(null);
    const [checkoutPending, setCheckoutPending] = useState(false);
    const [checkoutError, setCheckoutError] = useState("");
    const checkoutRequestInProgress = useRef(false);

    useEffect(() => {
        let cancelled = false;
        const roomId = room?.id ?? null;
        setBookingRoomId(roomId);
        setRoomBookings([]);
        setBookingsError("");
        setBookingsLoading(Boolean(roomId));
        setSelectedBookingId(null);
        setBookingDetails(null);
        setBookingDetailsError("");
        setCompletedCheckout(null);
        setRoomRefreshError(null);
        setConfirmationBooking(null);
        setCheckoutError("");

        if (!roomId) {
            setBookingsLoading(false);
            return () => { cancelled = true; };
        }

        void getBookingsForRoom(api, roomId).then((bookings) => {
            if (cancelled) return;
            const associatedBookings = bookings.filter((booking) => booking.roomId === roomId);
            const eligibleBookings = associatedBookings.filter(isCheckoutEligible);
            setRoomBookings(associatedBookings);
            if (eligibleBookings.length === 1) setSelectedBookingId(eligibleBookings[0].id);
        }).catch((error: any) => {
            if (!cancelled) setBookingsError(error?.response?.data?.error?.message ?? error?.message ?? "Could not load bookings for this room.");
        }).finally(() => {
            if (!cancelled) setBookingsLoading(false);
        });

        return () => { cancelled = true; };
    }, [api, room?.id, bookingRetryKey, bookingRefreshKey]);

    const currentRoomBookings = bookingRoomId === room?.id ? roomBookings : [];
    const eligibleBookings = currentRoomBookings.filter(isCheckoutEligible);
    const selectedBookingSummary = eligibleBookings.length === 1
        ? eligibleBookings[0]
        : eligibleBookings.find((booking) => booking.id === selectedBookingId) ?? null;

    useEffect(() => {
        if (!room || !selectedBookingSummary) {
            setBookingDetails(null);
            setBookingDetailsError("");
            setBookingDetailsLoading(false);
            return;
        }

        let cancelled = false;
        setBookingDetails(null);
        setBookingDetailsError("");
        setBookingDetailsLoading(true);
        void getBookingDetails(api, selectedBookingSummary.id).then((booking) => {
            if (booking.roomId !== room.id) throw new Error("The selected booking does not belong to this room.");
            if (!cancelled) setBookingDetails(booking);
        }).catch((error: any) => {
            if (!cancelled) setBookingDetailsError(error?.response?.data?.error?.message ?? error?.message ?? "Could not load booking details.");
        }).finally(() => {
            if (!cancelled) setBookingDetailsLoading(false);
        });

        return () => { cancelled = true; };
    }, [api, room?.id, selectedBookingSummary?.id, bookingDetailsRetryKey]);

    const currentBookingDetails = selectedBookingSummary && bookingDetails?.id === selectedBookingSummary.id
        ? bookingDetails
        : null;

    const handleCheckout = async (booking: BookingSummary) => {
        if (checkoutRequestInProgress.current) return;
        if (!isCheckoutEligible(booking)) {
            const message = "Only checked-in, checkout-due, or overdue bookings can be checked out.";
            setCheckoutError(message);
            throw new Error(message);
        }

        checkoutRequestInProgress.current = true;
        setCheckoutPending(true);
        setCheckoutError("");
        try {
            const updatedBooking = await checkoutBooking(api, booking.id);
            if (updatedBooking.id !== booking.id || updatedBooking.roomId !== booking.roomId) {
                throw new Error("The checkout response did not match the selected booking and room.");
            }
            if (updatedBooking.status !== "CHECKED_OUT") {
                setRoomBookings((current) => current.map((item) => item.id === updatedBooking.id ? updatedBooking : item));
                setBookingDetails(updatedBooking);
                throw new Error("The server response did not confirm that this booking reached CHECKED_OUT status. Refresh the booking before continuing.");
            }

            setRoomBookings((current) => current.map((item) => item.id === updatedBooking.id ? updatedBooking : item));
            setBookingDetails(null);
            setSelectedBookingId(null);
            setCompletedCheckout(updatedBooking);
            toast.success(`${guestName(updatedBooking)} checked out`, {
                description: `Room ${room?.number ?? updatedBooking.room?.number ?? ""} · Booking status: ${updatedBooking.status}.`,
            });

            void refreshRooms().then(() => {
                setRoomRefreshError((current) => current?.roomId === booking.roomId ? null : current);
            }).catch(() => {
                const message = "Checkout succeeded, but the room list could not be refreshed. The current room status is unconfirmed.";
                setRoomRefreshError({ roomId: booking.roomId, message });
                toast.error(message);
            });
        } catch (error: any) {
            const message = checkoutErrorMessage(error);
            setCheckoutError(message);
            toast.error("Could not check out guest", { description: message });
            throw new Error(message);
        } finally {
            checkoutRequestInProgress.current = false;
            setCheckoutPending(false);
        }
    };

    const handleConfirmCheckout = async () => {
        if (checkoutRequestInProgress.current) return;
        if (!confirmationBooking || confirmationBooking.roomId !== room?.id) {
            setCheckoutError("The selected booking is no longer available for this room. Refresh the booking information and try again.");
            return;
        }
        try {
            await handleCheckout(confirmationBooking);
            setConfirmationBooking(null);
        } catch {
            // The error remains visible in the confirmation dialog.
        }
    };

    const handleStartCheckout = () => {
        if (!checkoutBookingCandidate || !room || checkoutBookingCandidate.roomId !== room.id || !isCheckoutEligible(checkoutBookingCandidate)) {
            const message = "A valid eligible booking is not available for checkout. Refresh the booking information and try again.";
            setCheckoutError(message);
            toast.error("Could not start checkout", { description: message });
            return;
        }
        setCheckoutError("");
        setConfirmationBooking(checkoutBookingCandidate);
    };

    if (!room) {
        return (
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <Bed className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <h4 className="text-sm font-bold text-foreground">No Room Selected</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Click on any room card from the list to view its booking details and quick actions.
                </p>
                {action && onCreateRoom && <Button onClick={onCreateRoom} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create room</Button>}
            </div>
        );
    }

    const isOccupied = room.status === "Occupied" || room.status === "Checkout Due" || room.status === "Overdue";
    const isAvailable = room.status === "Available";
    const detailBooking = currentBookingDetails ?? selectedBookingSummary ?? (completedCheckout?.roomId === room.id ? completedCheckout : null);
    const checkoutBookingCandidate = currentBookingDetails ?? selectedBookingSummary;
    const canCheckOut = Boolean(isOccupied && checkoutBookingCandidate && isCheckoutEligible(checkoutBookingCandidate));
    const isConfirmationOpen = confirmationBooking?.roomId === room.id;

    const formatNairaAmount = (amount: number) => new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);

    return (
        <>
            <Card className="sticky top-6">
                <CardHeader>
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-[17px] font-bold text-foreground">Room {room.number}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isAvailable
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                    }`}>
                                    {room.status}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{room.type} · {room.floor} · {room.wing}</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="relative rounded-lg overflow-hidden h-36 bg-secondary">
                        <img src={room.image} alt={room.type} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-primary shadow-sm">
                            {formatNairaAmount(room.pricePerNight)} <span className="text-[10px] font-normal text-muted-foreground">/ night</span>
                        </div>
                    </div>

                    <section className="mt-4 space-y-3" aria-labelledby="room-booking-details-title">
                        <h4 id="room-booking-details-title" className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest">Booking Information</h4>
                        {bookingRoomId !== room.id || bookingsLoading ? (
                            <p role="status" className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">Loading bookings for this room…</p>
                        ) : bookingsError ? (
                            <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                <p role="alert" className="text-sm text-destructive">{bookingsError}</p>
                                <Button type="button" variant="outline" size="sm" onClick={() => setBookingRetryKey((current) => current + 1)}>Retry booking lookup</Button>
                            </div>
                        ) : (
                            <>
                                {eligibleBookings.length > 1 && (
                                    <div className="space-y-2">
                                        <label htmlFor="room-booking-select" className="text-sm font-medium text-foreground">Select the booking to check out</label>
                                        <select
                                            id="room-booking-select"
                                            value={selectedBookingId ?? ""}
                                            onChange={(event) => {
                                                setSelectedBookingId(event.target.value || null);
                                                setCompletedCheckout(null);
                                                setCheckoutError("");
                                            }}
                                            className="w-full rounded-[var(--radius)] border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">Choose a guest booking</option>
                                            {eligibleBookings.map((booking) => (
                                                <option key={booking.id} value={booking.id}>
                                                    {guestName(booking)} · {bookingStatusLabel(booking.status)} · expected {formatDateTime(booking.expectedCheckoutAt)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {eligibleBookings.length === 0 && roomBookings.length === 0 && !completedCheckout && (
                                    <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">No booking records were returned for this room.</p>
                                )}

                                {eligibleBookings.length === 0 && roomBookings.length > 0 && (
                                    <div className="space-y-2 rounded-lg bg-secondary p-3">
                                        <p className="text-sm text-muted-foreground">No booking for this room is currently eligible for checkout.</p>
                                        <ul className="space-y-1 text-sm">
                                            {roomBookings.map((booking) => (
                                                <li key={booking.id} className="flex flex-wrap justify-between gap-2">
                                                    <span className="font-medium text-foreground">{guestName(booking)}</span>
                                                    <span className="text-muted-foreground">{bookingStatusLabel(booking.status)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {eligibleBookings.length > 1 && !selectedBookingId && (
                                    <p className="text-xs text-muted-foreground">Choose the correct guest before viewing details or checking out.</p>
                                )}

                                {selectedBookingSummary && bookingDetailsLoading && (
                                    <p role="status" className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">Loading booking details…</p>
                                )}
                                {selectedBookingSummary && bookingDetailsError && (
                                    <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                        <p role="alert" className="text-sm text-destructive">{bookingDetailsError}</p>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setBookingDetailsRetryKey((current) => current + 1)}>Retry booking details</Button>
                                    </div>
                                )}
                                {detailBooking && (
                                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Users className="h-4 w-4 text-primary" />
                                            <span>{guestName(detailBooking)}</span>
                                            {detailBooking.guestGender && <span className="text-xs font-medium text-muted-foreground">({detailBooking.guestGender})</span>}
                                        </div>
                                        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                            <div><dt className="text-xs font-medium text-muted-foreground">Contact</dt><dd className="mt-0.5 flex items-center gap-1.5 text-foreground"><Phone className="h-3.5 w-3.5 text-primary" />{detailBooking.guestPhone ?? "Contact unavailable"}</dd></div>
                                            <div><dt className="text-xs font-medium text-muted-foreground">Room and category</dt><dd className="mt-0.5 text-foreground">{detailBooking.room?.number ?? room.number} · {detailBooking.room?.category?.name ?? room.type}</dd></div>
                                            <div><dt className="text-xs font-medium text-muted-foreground">Booking status</dt><dd className="mt-0.5 font-semibold text-foreground">{bookingStatusLabel(detailBooking.status)}</dd></div>
                                            <div><dt className="text-xs font-medium text-muted-foreground">Check-in</dt><dd className="mt-0.5 flex items-center gap-1.5 text-foreground"><Calendar className="h-3.5 w-3.5 text-primary" />{formatDateTime(detailBooking.checkInAt)}</dd></div>
                                            <div><dt className="text-xs font-medium text-muted-foreground">Expected checkout</dt><dd className="mt-0.5 text-foreground">{formatDateTime(detailBooking.expectedCheckoutAt)}</dd></div>
                                            <div><dt className="text-xs font-medium text-muted-foreground">Price per night</dt><dd className="mt-0.5 text-foreground">{formatBookingPrice(detailBooking.pricePerNightAtBooking)}</dd></div>
                                            <div><dt className="text-xs font-medium text-muted-foreground">Booking price</dt><dd className="mt-0.5 font-semibold text-foreground">{formatBookingPrice(detailBooking.totalPrice)}</dd></div>
                                        </dl>
                                    </div>
                                )}

                                {completedCheckout?.roomId === room.id && (
                                    <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                                        Checkout confirmed by the server. Booking status: <strong>{bookingStatusLabel(completedCheckout.status)}</strong>.
                                    </p>
                                )}
                            </>
                        )}
                        {roomRefreshError?.roomId === room.id && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{roomRefreshError.message}</p>}
                    </section>

                    <div className="mt-4 border-t border-border pt-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Room Features</h4>
                        <div className="mt-2 flex items-center gap-4 text-xs text-foreground">
                            <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-primary" /> WiFi</span>
                            <span className="flex items-center gap-1.5"><Tv className="w-3.5 h-3.5 text-primary" /> TV</span>
                            <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-primary" /> AC</span>
                        </div>
                    </div>

                    {action && (
                        <div className="mt-3 space-y-2 border-t border-border pt-4">
                            {onCreateRoom && <Button variant="outline" onClick={onCreateRoom} className="h-10 w-full"><Plus className="h-4 w-4" /><span>Create room</span></Button>}
                            {canCheckOut && <Button
                                type="button"
                                variant="destructive"
                                disabled={checkoutPending}
                                onClick={handleStartCheckout}
                                className="h-10 w-full"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Check Out Guest</span>
                            </Button>}
                            {isOccupied && <Button variant="secondary" onClick={() => onOrderService?.(room)} className="h-10 w-full">
                                <UtensilsCrossed className="h-4 w-4 text-primary" />
                                <span>Order Room Service</span>
                            </Button>}
                            {isAvailable && !canCheckOut && <Button onClick={() => onBookNow?.(room)} className="h-11 w-full"><Sparkles className="h-4 w-4" /><span>Book Room Now</span></Button>}
                            {!isAvailable && !isOccupied && !canCheckOut && <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">This room is not marked Available by the Rooms API, so booking is not offered.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={Boolean(isConfirmationOpen)}
                onOpenChange={(open) => {
                    if (!open && !checkoutPending) {
                        setConfirmationBooking(null);
                        setCheckoutError("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-md" showCloseButton={!checkoutPending}>
                    {confirmationBooking && isConfirmationOpen && <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void handleConfirmCheckout();
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-foreground">Confirm guest checkout</DialogTitle>
                            <DialogDescription>
                                This action will check out {guestName(confirmationBooking)} from Room {room.number}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm">
                            <p className="font-semibold text-foreground">{guestName(confirmationBooking)}</p>
                            <p className="mt-1 text-muted-foreground">Room {room.number} · {room.type}</p>
                            <p className="mt-1 text-muted-foreground">Booking status: {bookingStatusLabel(confirmationBooking.status)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Confirm only after verifying the guest and room. Checkout will be recorded for this booking.</p>
                        {checkoutError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{checkoutError}</p>}
                        <DialogFooter>
                            {checkoutError && <Button type="button" variant="outline" disabled={checkoutPending} onClick={() => {
                                setConfirmationBooking(null);
                                setCheckoutError("");
                                setBookingRetryKey((current) => current + 1);
                            }}>Refresh booking</Button>}
                            <Button type="button" variant="outline" disabled={checkoutPending} onClick={() => { setConfirmationBooking(null); setCheckoutError(""); }}>Cancel</Button>
                            <Button type="submit" variant="destructive" disabled={checkoutPending}>
                                {checkoutPending ? "Checking out…" : "Confirm checkout"}
                            </Button>
                        </DialogFooter>
                    </form>}
                </DialogContent>
            </Dialog>
        </>
    );
};
