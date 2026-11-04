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
import { getBookingBalance, getBookingPayments, recordBookingPayment, type BookingPaymentMethod, type RecordedBookingPayment } from '~/services/payments';
import { UseMetricCards } from '~/Context/Context';

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

interface PaymentRecoveryEntry {
    method: BookingPaymentMethod;
    amount: string;
    status: 'outstanding' | 'recorded' | 'unknown';
    attempted?: boolean;
    paymentId?: string;
}

interface BookingPaymentRecovery {
    ownerUserId: string;
    bookingId: string;
    bookingTotal: number;
    entries: PaymentRecoveryEntry[];
    baselinePaymentIds: string[];
    statusError?: string;
}

function amountInCents(value: string | number) {
    const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value).trim());
    if (!match) return NaN;
    const fraction = match[2] ?? '';
    return Number(match[1]) * 100 + Number((fraction + '00').slice(0, 2)) + (Number(fraction[2] ?? '0') >= 5 ? 1 : 0);
}

async function reconcilePaymentRecovery(
    api: AxiosInstance,
    recovery: BookingPaymentRecovery,
    options: { promoteAttemptedToOutstanding?: boolean } = {},
): Promise<BookingPaymentRecovery> {
    try {
        const payments = await getBookingPayments(api, recovery.bookingId);
        const balance = await getBookingBalance(api, recovery.bookingId);
        const baselineIds = new Set(recovery.baselinePaymentIds);
        const matchedIds = new Set<string>(recovery.baselinePaymentIds);
        const entries = recovery.entries.map((entry) => ({ ...entry }));

        for (const entry of entries) {
            if (entry.status !== 'recorded') continue;
            if (!entry.paymentId) {
                entry.status = 'unknown';
                continue;
            }
            const confirmedPayment = payments.find((payment: RecordedBookingPayment) =>
                payment.id === entry.paymentId && !matchedIds.has(payment.id) && payment.bookingId === recovery.bookingId &&
                payment.method === entry.method && amountInCents(payment.amount) === amountInCents(entry.amount),
            );
            if (confirmedPayment) matchedIds.add(confirmedPayment.id);
            else {
                entry.status = 'unknown';
                delete entry.paymentId;
            }
        }

        for (const entry of entries) {
            if (entry.status === 'recorded') continue;
            const matchingPayment = payments.find((payment: RecordedBookingPayment) =>
                payment.bookingId === recovery.bookingId && !baselineIds.has(payment.id) && !matchedIds.has(payment.id) &&
                payment.method === entry.method && amountInCents(payment.amount) === amountInCents(entry.amount),
            );
            if (matchingPayment) {
                entry.status = 'recorded';
                entry.paymentId = matchingPayment.id;
                matchedIds.add(matchingPayment.id);
            }
        }

        const outstandingCents = entries.reduce((sum, entry) => entry.status === 'recorded' ? sum : sum + amountInCents(entry.amount), 0);
        const balanceMatches = amountInCents(balance.totalPrice) === amountInCents(recovery.bookingTotal) &&
            amountInCents(balance.balance) === outstandingCents &&
            amountInCents(balance.totalPaid) + amountInCents(balance.balance) === amountInCents(balance.totalPrice) &&
            balance.isFullyPaid === (amountInCents(balance.balance) === 0);
        if (!balanceMatches) {
            return {
                ...recovery,
                entries: entries.map((entry) => entry.status === 'recorded' ? entry : { ...entry, status: 'unknown' }),
                statusError: 'The current payment list and balance do not identify the outstanding entries safely. Refresh payment status before retrying.',
            };
        }

        const unresolvedAttempt = entries.some((entry) => entry.status !== 'recorded' && entry.attempted && !options.promoteAttemptedToOutstanding);

        return {
            ...recovery,
            entries: entries.map((entry) => entry.status === 'recorded' || (entry.attempted && !options.promoteAttemptedToOutstanding)
                ? entry.status === 'recorded' ? entry : { ...entry, status: 'unknown' }
                : { ...entry, status: 'outstanding' }),
            statusError: unresolvedAttempt
                ? 'A payment request may have reached the server. Refresh payment status before retrying it.'
                : undefined,
        };
    } catch (error: any) {
        return {
            ...recovery,
            entries: recovery.entries.map((entry) => entry.status === 'recorded' ? entry : { ...entry, status: 'unknown' }),
            statusError: error?.response?.data?.error?.message ?? error?.message ?? 'Could not check the booking payment status.',
        };
    }
}

function paymentRecoveryStorageKey(userId: string) {
    return `hms.booking-payment-recovery:${encodeURIComponent(userId)}`;
}

function readPaymentRecovery(userId: string): BookingPaymentRecovery | null {
    if (typeof window === 'undefined') return null;
    try {
        const value = JSON.parse(window.sessionStorage.getItem(paymentRecoveryStorageKey(userId)) ?? 'null');
        if (!value || (value.ownerUserId !== undefined && value.ownerUserId !== userId) || typeof value.bookingId !== 'string' ||
            !Number.isFinite(value.bookingTotal) || value.bookingTotal <= 0 || !Array.isArray(value.entries) || value.entries.length === 0) return null;
        const validMethods: BookingPaymentMethod[] = ['CASH', 'TRANSFER', 'CARD'];
        if (!value.entries.every((entry: any) => validMethods.includes(entry.method) &&
            typeof entry.amount === 'string' && amountInCents(entry.amount) > 0 && ['outstanding', 'recorded', 'unknown'].includes(entry.status) &&
            (entry.paymentId === undefined || typeof entry.paymentId === 'string'))) return null;
        const plannedTotal = value.entries.reduce((sum: number, entry: PaymentRecoveryEntry) => sum + amountInCents(entry.amount), 0);
        if (plannedTotal !== amountInCents(value.bookingTotal)) return null;
        const isLegacyRecovery = value.ownerUserId === undefined;
        return {
            ownerUserId: userId,
            bookingId: value.bookingId,
            bookingTotal: value.bookingTotal,
            entries: value.entries.map((entry: PaymentRecoveryEntry) => ({
                ...entry,
                status: isLegacyRecovery && entry.status !== 'recorded' ? 'unknown' : entry.status,
                attempted: isLegacyRecovery && entry.status !== 'recorded' ? true : entry.attempted ?? false,
            })),
            baselinePaymentIds: Array.isArray(value.baselinePaymentIds) ? value.baselinePaymentIds.filter((id: unknown) => typeof id === 'string') : [],
            statusError: typeof value.statusError === 'string' ? value.statusError : undefined,
        };
    } catch {
        return null;
    }
}

export const BookRoomModal: React.FC<BookRoomModalProps> = ({
    isOpen,
    room,
    api,
    onClose,
    onBookingComplete,
    modalWidthClass = "max-w-3xl",
}) => {
    const { currentShift, user, authLoading } = UseMetricCards();
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
        paymentMethod: 'CASH',
        checkInNow: false,
    }));
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [splitPayments, setSplitPayments] = useState<Array<{ method: BookingPaymentMethod; amount: string }>>([{ method: 'CASH', amount: '' }]);
    const [splitPaymentMode, setSplitPaymentMode] = useState(false);
    const [paymentRecovery, setPaymentRecovery] = useState<BookingPaymentRecovery | null>(null);
    const [recoveryLoadedForUserId, setRecoveryLoadedForUserId] = useState<string | null>(null);
    const [recoveryStatusLoading, setRecoveryStatusLoading] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (typeof user?.id !== 'string') {
            setPaymentRecovery(null);
            setRecoveryLoadedForUserId(null);
            setRecoveryStatusLoading(false);
            return;
        }

        let cancelled = false;
        const userId = user.id;
        const savedRecovery = readPaymentRecovery(userId);
        setRecoveryLoadedForUserId(userId);
        setPaymentRecovery(savedRecovery);
        setRecoveryStatusLoading(Boolean(savedRecovery));
        if (!savedRecovery) return () => { cancelled = true; };

        void reconcilePaymentRecovery(api, savedRecovery).then((reconciled) => {
            if (cancelled) return;
            if (!reconciled.statusError && reconciled.entries.every((entry) => entry.status === 'recorded')) {
                setPaymentRecovery(null);
            } else {
                setPaymentRecovery(reconciled);
            }
        }).finally(() => {
            if (!cancelled) setRecoveryStatusLoading(false);
        });

        return () => { cancelled = true; };
    }, [api, authLoading, user?.id]);

    useEffect(() => {
        const userId = typeof user?.id === 'string' ? user.id : null;
        if (typeof window === 'undefined' || authLoading || !userId || recoveryLoadedForUserId !== userId) return;
        try {
            const key = paymentRecoveryStorageKey(userId);
            if (paymentRecovery?.ownerUserId === userId) window.sessionStorage.setItem(key, JSON.stringify(paymentRecovery));
            else window.sessionStorage.removeItem(key);
        } catch {
            // Keep the in-memory recovery available if browser storage is unavailable.
        }
    }, [authLoading, paymentRecovery, recoveryLoadedForUserId, user?.id]);

    const activePaymentRecovery = !authLoading && typeof user?.id === 'string' &&
        recoveryLoadedForUserId === user.id && paymentRecovery?.ownerUserId === user.id
        ? paymentRecovery
        : null;

    useEffect(() => {
        if (!isOpen || activePaymentRecovery) return;
        setFormData({
            guestFirstName: '',
            guestLastName: '',
            guestPhone: '',
            guestGender: '',
            checkInDate: todayStr,
            checkOutDate: tomorrowStr,
            checkOutTime: '',
            paymentMethod: 'CASH',
            checkInNow: false,
        });
        setSubmitError('');
        setPaymentAmount('');
        setSplitPayments([{ method: 'CASH', amount: '' }]);
        setSplitPaymentMode(false);
    }, [activePaymentRecovery, isOpen, room?.id]);

    if (!isOpen) return null;

    const calculateNights = (): number => {
        const start = new Date(`${formData.checkInDate}T00:00:00`);
        const end = new Date(`${formData.checkOutDate}T00:00:00`);
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();
    const roomTotal = (room?.pricePerNight ?? 0) * nights;

    const grandTotal = roomTotal;

    const handleInputChange = <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setSubmitError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!room) return;
        const authenticatedUserId = typeof user?.id === 'string' ? user.id : null;
        if (!authenticatedUserId || recoveryLoadedForUserId !== authenticatedUserId) {
            setSubmitError('Checking your staff account. Wait a moment and try again.');
            return;
        }
        if (activePaymentRecovery) {
            setSubmitError('Resolve the existing booking payment recovery before creating another booking.');
            return;
        }
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
        const paymentsToRecord = formData.paymentMethod === 'CHARGE_TO_ROOM'
            ? []
            : splitPaymentMode
                ? splitPayments
                : [{ method: formData.paymentMethod as BookingPaymentMethod, amount: paymentAmount }];
        if (paymentsToRecord.some((payment) => !payment.amount.trim() || !Number.isFinite(Number(payment.amount)) || Number(payment.amount) <= 0)) {
            setSubmitError('Enter a payment amount greater than zero for every payment method.');
            return;
        }
        const paymentTotal = paymentsToRecord.reduce((sum, payment) => sum + Number(payment.amount), 0);
        if (paymentsToRecord.length && amountInCents(paymentTotal) !== amountInCents(grandTotal)) {
            setSubmitError(`Payment amounts must add up to the booking total of ₦ ${grandTotal.toLocaleString()}.`);
            return;
        }
        if (paymentsToRecord.length && (!currentShift?.id || currentShift.status !== 'OPEN')) {
            setSubmitError('An active shift is required before recording booking payments. Open or refresh your shift and try again.');
            return;
        }
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(room.id)) {
            setSubmitError('This room is missing a valid room ID and cannot be booked. Refresh the room list and try again.');
            return;
        }

        setIsProcessing(true);
        setSubmitError('');
        let createdBookingId: string | null = null;
        let bookingWasCreated = false;
        let recoveryForBooking: BookingPaymentRecovery | null = null;
        try {
            const expectedCheckoutAt = new Date(`${formData.checkOutDate}T${formData.checkOutTime}:00`).toISOString();
            const bookingResponse = await api.post('/bookings', {
                roomId: room.id,
                guestFirstName: formData.guestFirstName.trim(),
                guestLastName: formData.guestLastName.trim(),
                guestPhone: formData.guestPhone.trim(),
                guestGender: formData.guestGender,
                nights,
                expectedCheckoutAt,
                paymentMethod: paymentsToRecord[0]?.method ?? formData.paymentMethod,
                checkInNow: formData.checkInNow,
            });
            bookingWasCreated = true;
            onBookingComplete?.();
            const booking = bookingResponse.data?.data?.booking;
            createdBookingId = typeof booking?.id === 'string' ? booking.id : null;
            const bookingTotal = Number(booking?.totalPrice);
            if (!createdBookingId || !Number.isFinite(bookingTotal)) {
                throw new Error('Booking was created, but its documented ID or total was missing from the response.');
            }
            if (paymentsToRecord.length && amountInCents(paymentTotal) !== amountInCents(bookingTotal)) {
                throw new Error(`Booking was created with a total of ₦ ${bookingTotal.toLocaleString()}, which differs from the entered payment total. No payments were sent.`);
            }
            if (paymentsToRecord.length) {
                recoveryForBooking = {
                    ownerUserId: authenticatedUserId,
                    bookingId: createdBookingId,
                    bookingTotal,
                    entries: paymentsToRecord.map((payment) => ({ ...payment, status: 'outstanding' })),
                    baselinePaymentIds: [],
                };
                setPaymentRecovery(recoveryForBooking);
                recoveryForBooking = await reconcilePaymentRecovery(api, recoveryForBooking);
                setPaymentRecovery(recoveryForBooking);
                if (recoveryForBooking.statusError) throw new Error(recoveryForBooking.statusError);
                for (let index = 0; index < recoveryForBooking.entries.length; index += 1) {
                    const entry = recoveryForBooking.entries[index];
                    if (entry.status !== 'outstanding') continue;
                    recoveryForBooking = {
                        ...recoveryForBooking,
                        entries: recoveryForBooking.entries.map((item, itemIndex) => itemIndex === index
                            ? { ...item, status: 'unknown', attempted: true }
                            : item),
                    };
                    setPaymentRecovery(recoveryForBooking);
                    const recorded = await recordBookingPayment(api, createdBookingId, Number(entry.amount), entry.method);
                    recoveryForBooking = {
                        ...recoveryForBooking,
                        entries: recoveryForBooking.entries.map((item, itemIndex) => itemIndex === index
                            ? { ...item, status: 'recorded', paymentId: recorded.id }
                            : item),
                    };
                    setPaymentRecovery(recoveryForBooking);
                    if (recorded.shiftId !== currentShift?.id || (typeof user?.id === 'string' && recorded.receivedByUserId !== user.id)) {
                        throw new Error('The server recorded a payment against a different user or shift. Contact an administrator before recording another payment.');
                    }
                }
            }
            toast.success(formData.checkInNow ? 'Guest checked in and booking created' : 'Room reserved', {
                description: paymentsToRecord.length ? `${paymentsToRecord.length} payment${paymentsToRecord.length === 1 ? '' : 's'} recorded.` : undefined,
            });
            setPaymentRecovery(null);
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.error?.message;
            const fallback = error?.message ?? 'Could not create the booking. Please try again.';
            if (bookingWasCreated && recoveryForBooking) {
                const reconciled = await reconcilePaymentRecovery(api, recoveryForBooking);
                if (!reconciled.statusError && reconciled.entries.every((entry) => entry.status === 'recorded')) {
                    toast.success('Booking payments confirmed', { description: `All payments for booking ${createdBookingId} are recorded.` });
                    setPaymentRecovery(null);
                    onClose();
                } else {
                    setPaymentRecovery(reconciled);
                    setSubmitError(typeof message === 'string' ? message : fallback);
                }
            } else {
                setSubmitError(bookingWasCreated
                    ? `Booking ${createdBookingId ?? '(ID unavailable)'} was created. Do not submit again. ${typeof message === 'string' ? message : fallback}`
                    : typeof message === 'string' ? message : fallback);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const retryOutstandingPayments = async () => {
        const recovery = activePaymentRecovery;
        if (!recovery || recoveryStatusLoading || isProcessing) return;
        const refreshOnly = Boolean(recovery.statusError) || recovery.entries.some((entry) => entry.status === 'unknown');
        setIsProcessing(true);
        setSubmitError('');
        try {
            let currentRecovery = await reconcilePaymentRecovery(api, recovery, { promoteAttemptedToOutstanding: true });
            setPaymentRecovery(currentRecovery);
            if (currentRecovery.statusError) {
                setSubmitError(currentRecovery.statusError);
                return;
            }
            if (refreshOnly) {
                if (currentRecovery.entries.every((entry) => entry.status === 'recorded')) {
                    toast.success('All booking payments are recorded.');
                    setPaymentRecovery(null);
                    onClose();
                } else {
                    setSubmitError('Payment status refreshed. Review the entries, then retry the ones marked Outstanding.');
                }
                return;
            }

            for (let index = 0; index < currentRecovery.entries.length; index += 1) {
                const entry = currentRecovery.entries[index];
                if (entry.status !== 'outstanding') continue;
                try {
                    currentRecovery = {
                        ...currentRecovery,
                        entries: currentRecovery.entries.map((item, itemIndex) => itemIndex === index
                            ? { ...item, status: 'unknown', attempted: true }
                            : item),
                    };
                    setPaymentRecovery(currentRecovery);
                    const recorded = await recordBookingPayment(api, currentRecovery.bookingId, Number(entry.amount), entry.method);
                    currentRecovery = {
                        ...currentRecovery,
                        entries: currentRecovery.entries.map((item, itemIndex) => itemIndex === index
                            ? { ...item, status: 'recorded', paymentId: recorded.id }
                            : item),
                    };
                    setPaymentRecovery(currentRecovery);
                    if (recorded.shiftId !== currentShift?.id || (typeof user?.id === 'string' && recorded.receivedByUserId !== user.id)) {
                        throw new Error('The server recorded this payment against a different user or shift. Contact an administrator before continuing.');
                    }
                } catch (error: any) {
                    const reconciled = await reconcilePaymentRecovery(api, currentRecovery);
                    setPaymentRecovery(reconciled);
                    setSubmitError(error?.response?.data?.error?.message ?? error?.message ?? 'Could not record the outstanding payment.');
                    return;
                }
            }

            const finalStatus = await reconcilePaymentRecovery(api, currentRecovery);
            setPaymentRecovery(finalStatus);
            if (!finalStatus.statusError && finalStatus.entries.every((entry) => entry.status === 'recorded')) {
                toast.success('All booking payments are recorded.');
                setPaymentRecovery(null);
                onClose();
            } else {
                setSubmitError(finalStatus.statusError ?? 'Some payment entries remain outstanding.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (activePaymentRecovery) {
        const outstandingCount = activePaymentRecovery.entries.filter((entry) => entry.status === 'outstanding').length;
        const outstandingAmount = activePaymentRecovery.entries.reduce((sum, entry) => entry.status === 'outstanding' ? sum + Number(entry.amount) : sum, 0);
        const canCheckAndRetry = !isProcessing && !recoveryStatusLoading;
        return !isOpen ? null : <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
            <section className="w-full max-w-2xl space-y-5 rounded-xl border border-border bg-card p-6 text-foreground shadow-2xl" aria-labelledby="payment-recovery-title">
                <div>
                    <h2 id="payment-recovery-title" className="text-xl font-bold">Recover booking payments</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Booking ID: <span className="font-mono">{activePaymentRecovery.bookingId}</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">Booking total: {formatNaira(activePaymentRecovery.bookingTotal)}</p>
                </div>
                <div className="space-y-2" aria-live="polite">
                    {activePaymentRecovery.entries.map((entry, index) => <div key={`${entry.method}-${entry.amount}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-secondary/30 p-3">
                        <div><p className="font-semibold">{entry.method.replace('_', ' ')} · {formatNaira(Number(entry.amount))}</p>
                            {entry.paymentId && <p className="text-xs text-muted-foreground">Payment ID: <span className="font-mono">{entry.paymentId}</span></p>}</div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${entry.status === 'recorded' ? 'bg-emerald-500/10 text-emerald-700' : entry.status === 'outstanding' ? 'bg-amber-500/10 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                            {entry.status === 'recorded' ? 'Recorded' : entry.status === 'outstanding' ? 'Outstanding' : 'Status unknown'}
                        </span>
                    </div>)}
                </div>
                {!activePaymentRecovery.statusError && <p className="text-sm font-semibold">Outstanding amount: {formatNaira(outstandingAmount)}</p>}
                {recoveryStatusLoading && <p role="status" className="text-sm text-muted-foreground">Checking this booking’s payment status…</p>}
                {activePaymentRecovery.statusError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{activePaymentRecovery.statusError}</p>}
                {submitError && !activePaymentRecovery.statusError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
                <p className="text-xs text-muted-foreground">Before retrying, the current balance and recorded payment list are checked. Recorded entries are never sent again.</p>
                <div className="flex justify-end gap-3 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>Close</Button>
                    <Button type="button" onClick={() => void retryOutstandingPayments()} disabled={!canCheckAndRetry || (outstandingCount === 0 && !activePaymentRecovery.statusError)}>
                        {isProcessing || recoveryStatusLoading ? 'Checking / recording payments…' : activePaymentRecovery.statusError ? 'Refresh payment status' : 'Check balance & retry outstanding'}
                    </Button>
                </div>
            </section>
        </div>;
    }

    if (!room) return null;

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
                        <p className="text-xs text-muted-foreground">Payments are recorded against the new booking and linked by the server to your authenticated account and active shift.</p>
                        {formData.paymentMethod !== 'CHARGE_TO_ROOM' && <div className="space-y-3 rounded-md border border-border p-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <input type="checkbox" checked={splitPaymentMode} onChange={(event) => {
                                    const enabled = event.target.checked;
                                    setSplitPaymentMode(enabled);
                                    if (enabled) setSplitPayments([{ method: formData.paymentMethod as BookingPaymentMethod, amount: paymentAmount }]);
                                }} className="accent-primary" />
                                Split payment across methods
                            </label>
                            {splitPaymentMode ? <div className="space-y-2">
                                {splitPayments.map((payment, index) => <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                    <select aria-label={`Payment method ${index + 1}`} value={payment.method} onChange={(event) => setSplitPayments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, method: event.target.value as BookingPaymentMethod } : item))} className="h-10 rounded-md border border-input bg-card px-2 text-sm">
                                        <option value="CASH">Cash</option><option value="TRANSFER">Bank Transfer</option><option value="CARD">Card</option>
                                    </select>
                                    <input aria-label={`Payment amount ${index + 1}`} type="number" min="0.01" step="0.01" value={payment.amount} onChange={(event) => setSplitPayments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item))} placeholder="Amount (₦)" className="h-10 rounded-md border border-input bg-card px-3 text-sm" />
                                    {splitPayments.length > 1 && <Button type="button" variant="outline" onClick={() => setSplitPayments((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>}
                                </div>)}
                                <Button type="button" variant="outline" onClick={() => setSplitPayments((items) => [...items, { method: 'CASH', amount: '' }])}>Add payment method</Button>
                                <p className="text-xs text-muted-foreground">Entered total: ₦ {splitPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0).toLocaleString()} / ₦ {grandTotal.toLocaleString()}</p>
                            </div> : <div className="space-y-1.5">
                                <label htmlFor="booking-payment-amount" className="text-xs font-semibold text-foreground">Payment amount (₦)</label>
                                <input id="booking-payment-amount" type="number" min="0.01" step="0.01" required value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} placeholder={grandTotal.toFixed(2)} className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" />
                            </div>}
                        </div>}
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
                                disabled={isProcessing || typeof user?.id !== 'string' || recoveryLoadedForUserId !== user.id || Boolean(activePaymentRecovery) || formData.checkInDate > todayStr || nights < 1 || !formData.checkOutTime || !formData.paymentMethod}
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
