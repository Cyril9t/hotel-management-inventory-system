import { useMemo, useState } from "react";
import { MOCK_RECORDS } from "./data";
import { ReceptionHistoryHeader } from "./header";
import { HistoryFilterBar } from "./historyFilter";
import { HistoryTable, type ActivityRecord } from "./historyTable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ActivityDetailModal from "./ActivitiesDetails";

export const History: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    // Filter Logic
    const filteredRecords = useMemo(() => {
        return MOCK_RECORDS.filter((rec) => {
            // Tab Filter
            const matchesTab = activeTab === 'all' || rec.type === activeTab;

            // Search Filter
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
    }, [activeTab, searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRecords.slice(start, start + itemsPerPage);
    }, [filteredRecords, currentPage]);

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. Header Section */}
                <ReceptionHistoryHeader />

                {/* 2. Filter & Controls Bar */}
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

                {/* 3. Main Audit History Table */}
                <HistoryTable
                    records={paginatedRecords}
                    onSelectRecord={(rec) => setSelectedRecord(rec)}
                />

                {/* 4. Pagination & Count Status Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-muted-foreground border-t border-border/60">
                    <p>
                        Showing{' '}
                        <span className="font-bold text-foreground">
                            {filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-bold text-foreground">
                            {Math.min(currentPage * itemsPerPage, filteredRecords.length)}
                        </span>{' '}
                        of <span className="font-bold text-foreground">{filteredRecords.length}</span> audit logs
                    </p>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-7 h-7 text-xs font-bold rounded-[var(--radius)] transition-colors ${currentPage === pageNum
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-input bg-card hover:bg-secondary text-foreground'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground disabled:opacity-40 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

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