import { useEffect, useMemo, useState } from "react";
import { ReceptionHistoryHeader } from "./header";
import { HistoryFilterBar } from "./historyFilter";
import { HistoryTable, type ActivityRecord } from "./historyTable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ActivityDetailModal from "./ActivitiesDetails";
import { UseMetricCards } from "~/Context/Context";
import { Button } from "~/components/ui/button";
import type { ShiftRecord } from "~/services/shifts";

function toActivityRecord(shift: ShiftRecord): ActivityRecord {
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
        staffName: shift.userId ? `User ${shift.userId}` : '—',
        staffRole: shift.department ?? '—',
        status: shift.status ?? '—',
        statusColor: '',
        refId: shift.id,
        rawShift: shift,
    };
}

export const History: React.FC = () => {
    const { shiftList, shiftListLoading, shiftListError, shiftListLoaded, loadShiftList } = UseMetricCards();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    useEffect(() => {
        if ((activeTab === 'all' || activeTab === 'shift') && !shiftListLoaded && !shiftListLoading && !shiftListError) {
            void loadShiftList().catch(() => {});
        }
    }, [activeTab, shiftListLoaded, shiftListLoading, shiftListError, loadShiftList]);

    const shiftRecords = useMemo<ActivityRecord[]>(() => (shiftList as ShiftRecord[]).map(toActivityRecord), [shiftList]);


    const filteredRecords = useMemo(() => {
        const records = shiftRecords;
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

            return matchesTab && matchesSearch;
        });
    }, [activeTab, searchTerm, shiftRecords]);


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
                    setSelectedDate={setSelectedDate}
                />


                <HistoryTable
                    records={paginatedRecords}
                    onSelectRecord={(rec) => setSelectedRecord(rec)}
                />

                {(activeTab === 'all' || activeTab === 'shift') && shiftListLoading && <div role="status" className="mt-4 h-24 animate-pulse rounded-xl bg-muted" />}
                {(activeTab === 'all' || activeTab === 'shift') && shiftListError && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <span>{shiftListError}</span><Button variant="outline" size="sm" onClick={() => { void loadShiftList().catch(() => {}); }}>Retry</Button>
                </div>}
                {activeTab === 'shift' && shiftListLoaded && shiftRecords.length === 0 && <p className="mt-4 rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">No shifts were returned by the API.</p>}
                {activeTab !== 'shift' && shiftListLoaded && filteredRecords.length === 0 && <p className="mt-4 rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">No matching live shift records are available for this filter.</p>}


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
