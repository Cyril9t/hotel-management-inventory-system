import React, { useState } from 'react';
import {
    X,
    Calendar,
    User,
    Mail,
    Phone,
    CreditCard,
    Building2,
    Receipt,
    CheckCircle2,
    Lock,
    BedDouble,
    Users,
    Banknote,
    ArrowLeftRight
} from 'lucide-react';
import { formatNaira } from '../data';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

export interface SelectedRoom {
    id: string;
    number: string;
    type: string;
    pricePerNight: number;
    maxGuests: number;
    bedCount: string;
    floor?: string;
    wing?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'paystack' | 'bank_transfer' | 'folio_charge' | '';

export interface BookingFormData {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkInDate: string;
    checkOutDate: string;
    adultsCount: number;
    childrenCount: number;
    paymentMethod: PaymentMethod;
    specialRequests: string;
}

export interface BookRoomModalProps {
    isOpen: boolean;
    room: SelectedRoom | null;
    onClose: () => void;
    onBookingComplete?: (bookingData: BookingFormData & { room: SelectedRoom; totalAmount: number }) => void;
    modalWidthClass?: string;
}

export const BookRoomModal: React.FC<BookRoomModalProps> = ({
    isOpen,
    room,
    onClose,
    onBookingComplete,
    modalWidthClass = "max-w-3xl",
}) => {

    if (!isOpen || !room) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [formData, setFormData] = useState<BookingFormData>({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkInDate: todayStr,
        checkOutDate: tomorrowStr,
        adultsCount: 1,
        childrenCount: 0,
        paymentMethod: '',
        specialRequests: '',
    });

    const [isProcessing, setIsProcessing] = useState<boolean>(false);


    const calculateNights = (): number => {
        const start = new Date(formData.checkInDate);
        const end = new Date(formData.checkOutDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };

    const nights = calculateNights();
    const roomTotal = room.pricePerNight * nights;
    const serviceFee = roomTotal * 0.05;
    const grandTotal = roomTotal + serviceFee;

    const handleInputChange = (field: keyof BookingFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        setTimeout(() => {
            setIsProcessing(false);
            if (onBookingComplete) {
                onBookingComplete({
                    ...formData,
                    room,
                    totalAmount: grandTotal,
                });
            }
            onClose();
        }, 1500);
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Guest Full Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                                        <User className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter guest name"
                                        value={formData.guestName}
                                        onChange={(e) => handleInputChange('guestName', e.target.value)}
                                        className="w-full text-sm h-10 pl-9 pr-3.5 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Email Address</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        placeholder="guest@email.com"
                                        value={formData.guestEmail}
                                        onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                                        className="w-full text-sm h-10 placeholder:text-sm pl-9 pr-3.5 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Phone Number</label>
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
                        </div>
                    </div>


                    <div className="space-y-4 pt-6 border-t border-border mt-6">
                        <h3 className="text-[16px] font-bold text-foreground flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-primary" />
                            Stay Schedule & Occupants
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Check-in Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.checkInDate}
                                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Check-out Date</label>
                                <input
                                    type="date"
                                    required
                                    min={formData.checkInDate}
                                    value={formData.checkOutDate}
                                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Adults</label>
                                <select
                                    value={formData.adultsCount}
                                    onChange={(e) => handleInputChange('adultsCount', Number(e.target.value))}
                                    className="w-full h-9 px-3 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                >
                                    <option value={1}>1 Adult</option>
                                    <option value={2}>2 Adults</option>
                                    <option value={3}>3 Adults</option>
                                    <option value={4}>4 Adults</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Children</label>
                                <select
                                    value={formData.childrenCount}
                                    onChange={(e) => handleInputChange('childrenCount', Number(e.target.value))}
                                    className="w-full h-9 px-3 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                >
                                    <option value={0}>0 Children</option>
                                    <option value={1}>1 Child</option>
                                    <option value={2}>2 Children</option>
                                </select>
                            </div>
                        </div>
                    </div>



                    <div className="space-y-4 pt-2 border-t border-border">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Payment Method
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                            {/* 1. Cash */}
                            <label
                                className={`flex items-start gap-3 p-3.5 rounded-[var(--radius)] border cursor-pointer transition-all ${formData.paymentMethod === 'cash'
                                    ? 'bg-accent/40 border-primary shadow-sm'
                                    : 'bg-card border-input hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={formData.paymentMethod === 'cash'}
                                    onChange={() => handleInputChange('paymentMethod', 'cash')}
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

                            {/* 2. Card */}
                            <label
                                className={`flex items-start gap-3 p-3.5 rounded-[var(--radius)] border cursor-pointer transition-all ${formData.paymentMethod === 'card'
                                    ? 'bg-accent/40 border-primary shadow-sm'
                                    : 'bg-card border-input hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={formData.paymentMethod === 'card'}
                                    onChange={() => handleInputChange('paymentMethod', 'card')}
                                    className="mt-0.5 text-primary focus:ring-ring accent-primary"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                                        <span>Card / POS</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Terminal POS or Paystack Online</p>
                                </div>
                            </label>

                            {/* 3. Transfer */}
                            <label
                                className={`flex items-start gap-3 p-3.5 rounded-[var(--radius)] border cursor-pointer transition-all ${formData.paymentMethod === 'transfer'
                                    ? 'bg-accent/40 border-primary shadow-sm'
                                    : 'bg-card border-input hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={formData.paymentMethod === 'transfer'}
                                    onChange={() => handleInputChange('paymentMethod', 'transfer')}
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

                        </div>
                    </div>

                    <div className="bg-secondary/40 border border-border rounded-[var(--radius)] p-4 space-y-2 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Room Rate ({nights} night{nights > 1 ? 's' : ''})</span>
                            <span className="font-semibold text-foreground">₦ {roomTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Taxes & Service Fee (5%)</span>
                            <span className="font-semibold text-foreground">₦ {serviceFee.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-foreground">
                            <span>Total Payable Amount</span>
                            <span className="text-primary font-serif">₦ {grandTotal.toLocaleString()}</span>
                        </div>
                    </div>


                    <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Lock className="w-3.5 h-3.5 text-primary" />
                            <span>Secured by Brandy Hotel Management System</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card text-foreground hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="px-5 py-2.5 text-xs font-semibold rounded-[var(--radius)] bg-primary text-primary-foreground shadow-md hover:opacity-95 transition-all flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Processing Payment...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>
                                            {formData.paymentMethod === 'paystack'
                                                ? 'Pay with Paystack'
                                                : 'Confirm & Book Room'}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default BookRoomModal;