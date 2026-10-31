import React, { useEffect, useState } from 'react';
import {
    X,
    Calendar,
    User,
    Phone,
    CreditCard,
    CheckCircle2,
    Lock,
    BedDouble,
    Users,
    Banknote,
    ArrowLeftRight,
    Receipt,
} from 'lucide-react';
import { formatNaira } from '../data';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import type { AxiosInstance } from 'axios';
import { toast } from 'sonner';

export interface SelectedRoom {
    id: string;
    number: string;
    type: string;
    pricePerNight: number;
    maxGuests: number;
    bedCount: number;
    floor?: string;
    wing?: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CHARGE_TO_ROOM' | '';

export interface BookingFormData {
    guestFirstName: string;
    guestLastName: string;
    guestPhone: string;
    guestGender: string;
    checkInDate: string;
    checkOutDate: string;
    checkOutTime: string;
    paymentMethod: PaymentMethod;
    checkInNow: boolean;
}

export interface BookRoomModalProps {
    isOpen: boolean;
    room: SelectedRoom | null;
    api: AxiosInstance;
    onClose: () => void;
    onBookingComplete?: () => void;
    modalWidthClass?: string;
}

function toLocalDateInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const BookRoomModal: React.FC<BookRoomModalProps> = ({
    isOpen,
    room,
    api,
    onClose,
    onBookingComplete,
    modalWidthClass = "max-w-3xl",
}) => {
    const today = new Date();
    const todayStr = toLocalDateInputValue(today);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toLocalDateInputValue(tomorrow);
    const [formData, setFormData] = useState<BookingFormData>(() => ({
        guestFirstName: '',
        guestLastName: '',
        guestPhone: '',
        guestGender: '',
        checkInDate: todayStr,
        checkOutDate: tomorrowStr,
        checkOutTime: '',
        paymentMethod: '',
        checkInNow: false,
    }));
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setFormData({
            guestFirstName: '',
            guestLastName: '',
            guestPhone: '',
            guestGender: '',
            checkInDate: todayStr,
            checkOutDate: tomorrowStr,
            checkOutTime: '',
            paymentMethod: '',
            checkInNow: false,
        });
        setSubmitError('');
    }, [isOpen, room?.id]);

    if (!isOpen || !room) return null;

    const calculateNights = (): number => {
        const start = new Date(`${formData.checkInDate}T00:00:00`);
        const end = new Date(`${formData.checkOutDate}T00:00:00`);
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();
    const roomTotal = room.pricePerNight * nights;

    const grandTotal = roomTotal;

    const handleInputChange = <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setSubmitError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.checkInDate > todayStr) {
            setSubmitError('Future arrival dates are not supported by the current booking API. Choose today or ask the backend team to add plannedCheckInAt support.');
            return;
        }
        if (nights < 1) {
            setSubmitError('Check-out must be after the arrival date.');
            return;
        }
        if (!formData.checkOutTime) {
            setSubmitError('Select a check-out time to continue.');
            return;
        }
        if (!formData.paymentMethod) {
            setSubmitError('Select a payment method to continue.');
            return;
        }
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(room.id)) {
            setSubmitError('This room is missing a valid room ID and cannot be booked. Refresh the room list and try again.');
            return;
        }

        setIsProcessing(true);
        setSubmitError('');
        try {
            const expectedCheckoutAt = new Date(`${formData.checkOutDate}T${formData.checkOutTime}:00`).toISOString();
            await api.post('/bookings', {
                roomId: room.id,
                guestFirstName: formData.guestFirstName.trim(),
                guestLastName: formData.guestLastName.trim(),
                guestPhone: formData.guestPhone.trim(),
                guestGender: formData.guestGender,
                nights,
                expectedCheckoutAt,
                paymentMethod: formData.paymentMethod,
                checkInNow: formData.checkInNow,
            });
            onBookingComplete?.();
            toast.success(formData.checkInNow ? 'Guest checked in and booking created' : 'Room reserved');
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.error?.message;
            setSubmitError(typeof message === 'string' ? message : 'Could not create the booking. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200">

            <div className={`relative w-full ${modalWidthClass} bg-card border border-border text-foreground shadow-2xl overflow-hidden rounded-[var(--radius)] flex flex-col max-h-[90vh]`}>


                <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-accent text-accent-foreground">
                            <BedDouble className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">
                                Book Room {room.number}
                            </h2>
                            <p className="text text-muted-foreground mt-">
                                {room.type} • <span className='text-foreground text-[20px] font-serif'>{formatNaira(room.pricePerNight)} </span>/ night
                            </p>
                        </div>
                    </div>
                    <Button
                        variant={"outline"}
                        onClick={onClose}
                        className=""
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>


                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    <div className='flex gap-4 w-full bg-brand-navy rounded-[10px] p-1'>
                        <Card className='bg-brand-navy border-none w-full'>
                            <CardHeader>
                                <h1 className='text-background font-bold text uppercase tracking-wide '>Room Number</h1>
                            </CardHeader>

                            <CardContent>
                                <p className="font-serif text-[20px] font-bold tracking-tight text-brand-gold-light">
                                    {room.number}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='bg-brand-navy border-none w-full'>
                            <CardHeader>
                                <h1 className='text-background font-bold text uppercase tracking-wide '>
                                    Room Category
                                </h1>
                            </CardHeader>

                            <CardContent>
                                <p className="font-serif text-[16px] font-bold tracking-tight text-brand-gold-light">
                                    {room.type}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='bg-brand-navy border-none w-full'>
                            <CardHeader>
                                <h1 className='text-background font-bold text uppercase tracking-wide'>Accommodation</h1>
                            </CardHeader>

                            <CardContent>
                                <div className='flex gap-4 text-background'>
                                    <div className='flex gap-0.5 '>
                                        <BedDouble size={18} className='text-brand-gold-light' />
                                        <span className='text-[12px]'>{room.bedCount} Bed</span>
                                    </div>
                                    <div className='flex'>
                                        <Users size={18} className='text-brand-gold-light' />
                                        <span className='text-[12px] '>{room.maxGuests} Guest</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='bg-brand-navy border-none w-full'>
                            <CardHeader>
                                <h1 className='text-background font-bold text uppercase tracking-wide'>Nightly Rate</h1>
                            </CardHeader>

                            <CardContent>
                                <p className="font-serif text-xl font-bold text-brand-gold-light">
                                    ₦{room.pricePerNight.toLocaleString()}
                                    <span className="ml-1 font-sans text-xs font-normal tejxt-background">
                                        / night
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-foreground flex items-center gap-2">
                            <User className="w-6 h-6 text-primary" />
                            Guest Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">First Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                                        <User className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter first name"
                                        value={formData.guestFirstName}
                                        onChange={(e) => handleInputChange('guestFirstName', e.target.value)}
                                        className="w-full text-sm h-10 pl-9 pr-3.5 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter last name"
                                    value={formData.guestLastName}
                                    onChange={(e) => handleInputChange('guestLastName', e.target.value)}
                                    className="w-full text-sm h-10 px-3.5 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                                        <Phone className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+234 800 000 0000"
                                        value={formData.guestPhone}
                                        onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2 text-sm h-10 placeholder:text-sm rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="guest-gender" className="text-sm font-semibold text-foreground">Guest Gender</label>
                                <select
                                    id="guest-gender"
                                    required
                                    value={formData.guestGender}
                                    onChange={(e) => handleInputChange('guestGender', e.target.value)}
                                    className="w-full h-10 px-3.5 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="space-y-4 pt-6 border-t border-border mt-6">
                        <h3 className="text-[16px] font-bold text-foreground flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-primary" />
                            Stay Schedule
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Arrival Date</label>
                                <input
                                    type="date"
                                    required
                                    min={todayStr}
                                    value={formData.checkInDate}
                                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                                <p className="text-xs text-muted-foreground">The API does not store arrival dates. Future arrivals are blocked so the date is not silently ignored.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Check-out Date</label>
                                <input
                                    type="date"
                                    required
                                    min={(() => { const nextDay = new Date(`${formData.checkInDate}T00:00:00`); nextDay.setDate(nextDay.getDate() + 1); return toLocalDateInputValue(nextDay); })()}
                                    value={formData.checkOutDate}
                                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Check-out Time (local)</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.checkOutTime}
                                    onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>
                        </div>
                        {formData.checkInDate > todayStr && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">The current booking API cannot save future arrival dates. You can still create a reservation or check-in for today.</p>}
                        <label className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={formData.checkInNow}
                                onChange={(e) => handleInputChange('checkInNow', e.target.checked)}
                                className="mt-0.5 accent-primary"
                            />
                            <span><span className="font-semibold">Check in the guest now</span><span className="mt-0.5 block text-xs text-muted-foreground">Leave unchecked to create a RESERVED booking for today without recording an actual check-in.</span></span>
                        </label>
                    </div>



                    <div className="space-y-4 pt-2 border-t border-border">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Payment Method
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">


                            <label
                                    className={`flex items-start gap-3 p-3.5 rounded-[var(--radius)] border cursor-pointer transition-all ${formData.paymentMethod === 'CASH'
                                    ? 'bg-accent/40 border-primary shadow-sm'
                                    : 'bg-card border-input hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    required
                                    checked={formData.paymentMethod === 'CASH'}
                                    onChange={() => handleInputChange('paymentMethod', 'CASH')}
                                    className="mt-0.5 text-primary focus:ring-ring accent-primary"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                                        <Banknote className="w-3.5 h-3.5 text-primary" />
                                        <span>Cash Payment</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Physical cash payment at desk</p>
                                </div>
                            </label>


                            <label
                                    className={`flex items-start gap-3 p-3.5 rounded-[var(--radius)] border cursor-pointer transition-all ${formData.paymentMethod === 'CARD'
                                    ? 'bg-accent/40 border-primary shadow-sm'
                                    : 'bg-card border-input hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={formData.paymentMethod === 'CARD'}
                                    onChange={() => handleInputChange('paymentMethod', 'CARD')}
                                    className="mt-0.5 text-primary focus:ring-ring accent-primary"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                                        <span>Card / POS</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Card / POS payment method</p>
                                </div>
                            </label>


                            <label
                                    className={`flex items-start gap-3 p-3.5 rounded-[var(--radius)] border cursor-pointer transition-all ${formData.paymentMethod === 'TRANSFER'
                                    ? 'bg-accent/40 border-primary shadow-sm'
                                    : 'bg-card border-input hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={formData.paymentMethod === 'TRANSFER'}
                                    onChange={() => handleInputChange('paymentMethod', 'TRANSFER')}
                                    className="mt-0.5 text-primary focus:ring-ring accent-primary"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                                        <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                                        <span>Bank Transfer</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Direct hotel bank account transfer</p>
                                </div>
                            </label>

                            <label
                                className={`flex items-start gap-3 p-3.5 rounded-[var(--radius)] border cursor-pointer transition-all ${formData.paymentMethod === 'CHARGE_TO_ROOM'
                                    ? 'bg-accent/40 border-primary shadow-sm'
                                    : 'bg-card border-input hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={formData.paymentMethod === 'CHARGE_TO_ROOM'}
                                    onChange={() => handleInputChange('paymentMethod', 'CHARGE_TO_ROOM')}
                                    className="mt-0.5 text-primary focus:ring-ring accent-primary"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                                        <Receipt className="w-3.5 h-3.5 text-primary" />
                                        <span>Charge to Room</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Add the amount to the guest folio</p>
                                </div>
                            </label>

                        </div>
                        <p className="text-xs text-muted-foreground">The booking API records the payment method; it does not process a payment.</p>
                    </div>

                    <div className="bg-secondary/40 border border-border rounded-[var(--radius)] p-4 space-y-2 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                            <span className='text-sm'>Room Rate ({nights} night{nights > 1 ? 's' : ''})</span>
                            <span className="text-sm font-semibold text-foreground">₦ {roomTotal.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-foreground">
                            <span className='text-sm'>Total Payable Amount</span>
                            <span className="text-xl text-primary font-serif">₦ {grandTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Estimate only. The booking API calculates the stored total from the room category price.</p>
                    </div>


                    <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Lock className="w-3.5 h-3.5 text-primary" />
                            <span>Secured by Brandy Hotel Management System</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant={"outline"}
                                type="button"
                                onClick={onClose}
                                className="h-10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isProcessing || formData.checkInDate > todayStr || nights < 1 || !formData.checkOutTime || !formData.paymentMethod}
                                className="h-10"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Creating booking...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{formData.checkInNow ? 'Check In & Book Room' : 'Reserve Room'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    {submitError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}

                </form>
            </div>
        </div>
    );
};

export default BookRoomModal;
