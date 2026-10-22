import React, { useState, useMemo } from 'react';
import { RoomServiceMetrics } from './RoomServiceMetrics';
import { RoomServiceTopFilter } from './Filter';
import { RoomServiceDrawer, type RoomServiceRecord } from './Drawer';
import {
    Utensils,
    Coffee,
    Package,
    MoreVertical,
    Eye,
    ChevronLeft,
    ChevronRight,
    Plus
} from 'lucide-react';

const INITIAL_RECORDS: RoomServiceRecord[] = [
    {
        id: 'RS-1042',
        room: '101',
        guest: 'Mr. John Carter',
        guestsCount: 2,
        itemsSummary: 'Burger, Coke +1 more',
        items: [
            { name: 'Gourmet Beef Burger', qty: 1, price: 9500 },
            { name: 'Chilled Coke', qty: 1, price: 1500 },
            { name: 'French Fries', qty: 1, price: 3500 },
        ],
        type: 'Food',
        status: 'In Progress',
        time: '12:45 PM',
        date: 'Oct 22, 2025',
        specialInstructions: 'No onions, extra napkins please.',
    },
    {
        id: 'RS-1041',
        room: '205',
        guest: 'Mrs. AdEza Okafor',
        guestsCount: 1,
        itemsSummary: 'Water, Snacks',
        items: [
            { name: 'Sparkling Water', qty: 2, price: 2000 },
            { name: 'Assorted Nuts', qty: 1, price: 4500 },
        ],
        type: 'Drinks',
        status: 'Pending',
        time: '11:32 AM',
        date: 'Oct 22, 2025',
    },
    {
        id: 'RS-1040',
        room: '308',
        guest: 'Mr. Daniel Williams',
        guestsCount: 2,
        itemsSummary: 'Pasta, Juice +1 more',
        items: [
            { name: 'Seafood Alfredo Pasta', qty: 2, price: 18000 },
            { name: 'Fresh Orange Juice', qty: 2, price: 5000 },
        ],
        type: 'Food',
        status: 'Delivered',
        time: '10:18 AM',
        date: 'Oct 22, 2025',
    },
    {
        id: 'RS-1039',
        room: '112',
        guest: 'Mrs. Blessing Eze',
        guestsCount: 1,
        itemsSummary: 'Towel, Soap Set',
        items: [
            { name: 'Extra Bath Towels', qty: 2, price: 0 },
            { name: 'Luxury Toiletries Kit', qty: 1, price: 2500 },
        ],
        type: 'Essentials',
        status: 'In Progress',
        time: '09:56 AM',
        date: 'Oct 22, 2025',
        specialInstructions: 'Deliver before 10:30 AM.',
    },
    {
        id: 'RS-1038',
        room: '402',
        guest: 'Mr. Samuel Adeyemi',
        guestsCount: 3,
        itemsSummary: 'Chicken Wings, Coke',
        items: [
            { name: 'Spicy BBQ Chicken Wings', qty: 2, price: 14000 },
            { name: 'Coke Zero', qty: 3, price: 4500 },
        ],
        type: 'Food',
        status: 'Delivered',
        time: '08:40 AM',
        date: 'Oct 22, 2025',
    },
    {
        id: 'RS-1037',
        room: '118',
        guest: 'Ms. Chioma Nwasu',
        guestsCount: 1,
        itemsSummary: 'Fruit Platter',
        items: [
            { name: 'Tropical Fruit Basket', qty: 1, price: 8500 },
        ],
        type: 'Food',
        status: 'Completed',
        time: '07:22 AM',
        date: 'Oct 22, 2025',
    },
];

export const RoomServiceModule: React.FC = () => {
    const [records, setRecords] = useState<RoomServiceRecord[]>(INITIAL_RECORDS);
    const [selectedRecord, setSelectedRecord] = useState<RoomServiceRecord | null>(INITIAL_RECORDS[0]);

    // Filter States
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    // Pagination State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    // Calculate real-time KPI metrics
    const metrics = useMemo(() => {
        return {
            total: records.length,
            inProgress: records.filter(r => r.status === 'In Progress' || r.status === 'Pending').length,
            completed: records.filter(r => r.status === 'Completed' || r.status === 'Delivered').length,
            cancelled: records.filter(r => r.status === 'Cancelled').length,
        };
    }, [records]);

    // Filtering & Sorting Logic
    const filteredRecords = useMemo(() => {
        return records
            .filter((rec) => {
                // Status Filter
                const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;

                // Type Filter
                const matchesType = typeFilter === 'all' || rec.type === typeFilter;

                // Search Filter
                const query = searchTerm.toLowerCase().trim();
                const matchesSearch =
                    query === '' ||
                    rec.room.toLowerCase().includes(query) ||
                    rec.guest.toLowerCase().includes(query) ||
                    rec.id.toLowerCase().includes(query) ||
                    rec.itemsSummary.toLowerCase().includes(query);

                return matchesStatus && matchesType && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return b.id.localeCompare(a.id);
                if (sortBy === 'oldest') return a.id.localeCompare(b.id);
                return 0;
            });
    }, [records, statusFilter, typeFilter, searchTerm, sortBy]);

    // Pagination Slice
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRecords.slice(start, start + itemsPerPage);
    }, [filteredRecords, currentPage]);

    // Handler to update status (e.g. In Progress -> Delivered)
    const handleUpdateStatus = (id: string, newStatus: string) => {
        setRecords((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedRecord && selectedRecord.id === id) {
            setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Food': return <Utensils className="w-3.5 h-3.5 text-amber-400" />;
            case 'Drinks': return <Coffee className="w-3.5 h-3.5 text-sky-400" />;
            case 'Essentials': return <Package className="w-3.5 h-3.5 text-purple-400" />;
            default: return <Utensils className="w-3.5 h-3.5 text-primary" />;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'In Progress': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
            case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive/30';
            default: return 'bg-secondary text-muted-foreground';
        }
    };

    return (
        <div className="">
            <div className="">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                    <div>
                        <h1 className="text-2xl font-bold font-serif text-foreground">Room Service Management</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Track, dispatch, and fulfill in-room food, beverages, and housekeeping requests.
                        </p>
                    </div>

                    <button className="px-4 py-2 text-xs font-semibold rounded-[var(--radius)] bg-primary text-primary-foreground shadow-md hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto">
                        <Plus className="w-4 h-4" />
                        <span>New Room Request</span>
                    </button>
                </div>

                {/* KPI Metrics Cards */}
                <RoomServiceMetrics
                    total={metrics.total}
                    inProgress={metrics.inProgress}
                    completed={metrics.completed}
                    cancelled={metrics.cancelled}
                />

                {/* Top Control Filter Bar (Replacing Left Sidebar) */}
                <RoomServiceTopFilter
                    searchTerm={searchTerm}
                    setSearchTerm={(term) => {
                        setSearchTerm(term);
                        setCurrentPage(1);
                    }}
                    statusFilter={statusFilter}
                    setStatusFilter={(st) => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                    }}
                    typeFilter={typeFilter}
                    setTypeFilter={(tp) => {
                        setTypeFilter(tp);
                        setCurrentPage(1);
                    }}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                />

                {/* Main Content Layout: Table + Right Drawer */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Requests Table Wrapper */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="p-3.5 pl-4">Request ID</th>
                                            <th className="p-3.5">Room</th>
                                            <th className="p-3.5">Guest Name</th>
                                            <th className="p-3.5">Ordered Items</th>
                                            <th className="p-3.5">Type</th>
                                            <th className="p-3.5">Status</th>
                                            <th className="p-3.5">Time</th>
                                            <th className="p-3.5 pr-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60 text-foreground font-medium">
                                        {paginatedRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                                    No room service requests match the selected filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRecords.map((rec) => {
                                                const isSelected = selectedRecord?.id === rec.id;
                                                return (
                                                    <tr
                                                        key={rec.id}
                                                        onClick={() => setSelectedRecord(rec)}
                                                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-secondary/60' : 'hover:bg-secondary/20'
                                                            }`}
                                                    >
                                                        <td className="p-3.5 pl-4 font-mono font-bold text-primary">
                                                            {rec.id}
                                                        </td>
                                                        <td className="p-3.5 font-bold font-serif text-sm text-foreground">
                                                            {rec.room}
                                                        </td>
                                                        <td className="p-3.5">
                                                            <p className="font-semibold text-foreground">{rec.guest}</p>
                                                            <p className="text-[10px] text-muted-foreground">{rec.guestsCount} Guest(s)</p>
                                                        </td>
                                                        <td className="p-3.5 text-muted-foreground max-w-[180px] truncate">
                                                            {rec.itemsSummary}
                                                        </td>
                                                        <td className="p-3.5">
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] font-semibold">
                                                                {getTypeIcon(rec.type)}
                                                                <span>{rec.type}</span>
                                                            </span>
                                                        </td>
                                                        <td className="p-3.5">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(rec.status)}`}>
                                                                {rec.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                                                            {rec.time}
                                                        </td>
                                                        <td className="p-3.5 pr-4 text-right">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedRecord(rec);
                                                                }}
                                                                className="px-3 py-1.5 text-[11px] font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground inline-flex items-center gap-1 transition-colors"
                                                            >
                                                                <Eye className="w-3.5 h-3.5 text-primary" />
                                                                <span>View</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                            <p>
                                Showing <span className="font-bold text-foreground">{paginatedRecords.length}</span> of <span className="font-bold text-foreground">{filteredRecords.length}</span> requests
                            </p>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground disabled:opacity-40 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="px-3 font-semibold text-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>

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

                    {/* Right Side Order Drawer Component */}
                    {selectedRecord && (
                        <RoomServiceDrawer
                            record={selectedRecord}
                            onClose={() => setSelectedRecord(null)}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    )}

                </div>

            </div>
        </div>
    );
};

export default RoomServiceModule;