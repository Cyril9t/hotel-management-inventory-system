import { useEffect, useMemo, useState } from "react";
import { ReceptionHistoryHeader } from "./header";
import { HistoryFilterBar } from "./historyFilter";
import { HistoryTable, type ActivityRecord } from "./historyTable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ActivityDetailModal from "./ActivitiesDetails";
import { UseMetricCards } from "~/Context/Context";
import { useAuth } from "~/Context/AuthContext";
import { useShift } from "~/Context/ShiftContext";
import { Button } from "~/components/ui/button";
import type { ShiftRecord } from "~/services/shifts";
import { getBookingHistory, type BookingRecord } from "~/services/bookings";

function nameFrom(parts: Array<unknown>): string {
    return parts.filter((part): part is string => typeof part === 'string' && part.trim().length > 0).join(' ');
}

function toActivityRecord(shift: ShiftRecord, currentUser: any): ActivityRecord {
    const openedAt = typeof shift.openedAt === 'string' ? new Date(shift.openedAt) : null;
    const validOpenedAt = openedAt && !Number.isNaN(openedAt.valueOf()) ? openedAt : null;
    const details = [shift.department, shift.status].filter(Boolean).join(' · ') || 'Shift data returned by the server';
    const amount = shift.actualCash == null ? undefined : Number(shift.actualCash);
    return {
        id: shift.id,
        type: 'shift',
        time: validOpenedAt ? validOpenedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        date: validOpenedAt ? validOpenedAt.toLocaleDateString() : '—',
        title: shift.status === 'CLOSED' ? 'Shift closed' : 'Shift opened',
        details,
        meta: [shift.openingCash != null ? `Opening cash: ₦ ${Number(shift.openingCash).toLocaleString()}` : null,
            shift.expectedCash != null ? `Expected cash: ₦ ${Number(shift.expectedCash).toLocaleString()}` : null,
            shift.variance != null ? `Variance: ₦ ${Number(shift.variance).toLocaleString()}` : null].filter(Boolean).join(' · '),
        amount: Number.isFinite(amount) ? amount : undefined,
        staffName: nameFrom([shift.user?.firstName, shift.user?.lastName]) ||
            (shift.userId && shift.userId === currentUser?.id ? nameFrom([currentUser?.firstName, currentUser?.lastName]) : '') || '—',
        staffRole: shift.department ?? '—',
        status: shift.status ?? '—',
        statusColor: '',
        refId: shift.id,
        rawShift: shift,
    };
}

function toBookingActivity(booking: BookingRecord, currentUser: any): ActivityRecord {
    const createdAt = new Date(booking.createdAt);
    const validCreatedAt = !Number.isNaN(createdAt.valueOf()) ? createdAt : null;
    const amount = Number(booking.totalPrice);
    const guest = `${booking.guestFirstName} ${booking.guestLastName}`.trim();
    return {
        id: booking.id,
        type: 'booking',
        time: validCreatedAt ? validCreatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        date: validCreatedAt ? validCreatedAt.toLocaleDateString() : '—',
        title: `Booking ${booking.status.toLowerCase().replaceAll('_', ' ')}`,
        details: `Room ${booking.room?.number ?? booking.roomId} · ${guest}`,
        meta: `${booking.nights} night${booking.nights === 1 ? '' : 's'} · ${booking.paymentMethod}`,
        amount: Number.isFinite(amount) ? amount : undefined,
        paymentMethod: booking.paymentMethod,
        staffName: nameFrom([booking.createdBy?.firstName, booking.createdBy?.lastName]) ||
            (booking.createdByUserId === currentUser?.id ? nameFrom([currentUser?.firstName, currentUser?.lastName]) : '') || '—',
        staffRole: 'Booking created by',
        status: booking.status,
        statusColor: '',
        refId: booking.id,
        rawBooking: booking,
    };
}

export const History: React.FC = () => {
    const { api } = UseMetricCards();
    const { shiftList, shiftListLoading, shiftListError, shiftListLoaded, loadShiftList } = useShift();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [bookingRecords, setBookingRecords] = useState<ActivityRecord[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingLoaded, setBookingLoaded] = useState(false);
    const itemsPerPage = 6;

    useEffect(() => {
        if ((activeTab === 'all' || activeTab === 'shift') && !shiftListLoaded && !shiftListLoading && !shiftListError) {
            void loadShiftList().catch(() => {});
        }
    }, [activeTab, shiftListLoaded, shiftListLoading, shiftListError, loadShiftList]);

    useEffect(() => {
        if ((activeTab === 'all' || activeTab === 'booking') && !bookingLoaded && !bookingLoading) {
            setBookingLoading(true);
            setBookingLoaded(true);
            setBookingError(null);
            void getBookingHistory(api).then((bookings) => {
                setBookingRecords(bookings.map((booking) => toBookingActivity(booking, user)));
                setBookingLoaded(true);
            }).catch((error: any) => {
                setBookingError(error?.response?.data?.error?.message ?? error?.message ?? 'Could not load booking history.');
            }).finally(() => setBookingLoading(false));
        }
    }, [activeTab, api, bookingLoaded, bookingLoading, user]);

    const shiftRecords = useMemo<ActivityRecord[]>(() => (shiftList as ShiftRecord[]).map((shift) => toActivityRecord(shift, user)), [shiftList, user]);


    const filteredRecords = useMemo(() => {
        const records = [...shiftRecords, ...bookingRecords];
        return records.filter((rec) => {

            const matchesTab = activeTab === 'all' || rec.type === activeTab;


            const query = searchTerm.toLowerCase().trim();
            const matchesSearch =
                query === '' ||
                rec.title.toLowerCase().includes(query) ||
                rec.details.toLowerCase().includes(query) ||
                rec.staffName.toLowerCase().includes(query) ||
                rec.refId.toLowerCase().includes(query) ||
                rec.id.toLowerCase().includes(query);

            const recordDate = rec.rawBooking?.createdAt ?? rec.rawShift?.openedAt;
            const matchesDate = !selectedDate || (recordDate ? new Date(recordDate).toISOString().slice(0, 10) === selectedDate : false);
            return matchesTab && matchesSearch && matchesDate;
        });
    }, [activeTab, searchTerm, selectedDate, shiftRecords, bookingRecords]);


    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRecords.slice(start, start + itemsPerPage);
    }, [filteredRecords, currentPage]);

    return (
        <div className="">
            <div className="">


                <ReceptionHistoryHeader />


                <HistoryFilterBar
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                    }}
                    searchTerm={searchTerm}
                    setSearchTerm={(term) => {
                        setSearchTerm(term);
                        setCurrentPage(1);
                    }}
                    selectedDate={selectedDate}
                    setSelectedDate={(date) => {
                        setSelectedDate(date);
                        setCurrentPage(1);
                    }}
                />


                {paginatedRecords.length > 0 && <HistoryTable
                    records={paginatedRecords}
                    onSelectRecord={(rec) => setSelectedRecord(rec)}
                />}

                {(activeTab === 'all' || activeTab === 'shift') && shiftListLoading && <div role="status" className="mt-4 h-24 animate-pulse rounded-xl bg-muted" />}
                {(activeTab === 'all' || activeTab === 'booking') && bookingLoading && <div role="status" className="mt-4 h-24 animate-pulse rounded-xl bg-muted" />}
                {(activeTab === 'all' || activeTab === 'shift') && shiftListError && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <span>{shiftListError}</span><Button variant="outline" size="sm" onClick={() => { void loadShiftList().catch(() => {}); }}>Retry</Button>
                </div>}
                {(activeTab === 'all' || activeTab === 'booking') && bookingError && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <span>{bookingError}</span><Button variant="outline" size="sm" onClick={() => { setBookingLoaded(false); setBookingError(null); }}>Retry</Button>
                </div>}
                {activeTab === 'shift' && shiftListLoaded && !shiftListLoading && filteredRecords.length === 0 && <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No shift history matches this filter.</p>}
                {activeTab === 'booking' && bookingLoaded && !bookingLoading && !bookingError && filteredRecords.length === 0 && <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No booking history matches this filter.</p>}
                {activeTab === 'all' && bookingLoaded && shiftListLoaded && !bookingLoading && !shiftListLoading && !bookingError && !shiftListError && filteredRecords.length === 0 && <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No history records match this filter.</p>}

                {filteredRecords.length > 0 && <div className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                        <span className="tabular-nums">Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>}


            </div>


            <ActivityDetailModal
                isOpen={!!selectedRecord}
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        </div>
    );
};

export default History;
