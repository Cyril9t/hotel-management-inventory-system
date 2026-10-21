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


    const filteredRecords = useMemo(() => {
        return MOCK_RECORDS.filter((rec) => {

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
    }, [activeTab, searchTerm]);


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