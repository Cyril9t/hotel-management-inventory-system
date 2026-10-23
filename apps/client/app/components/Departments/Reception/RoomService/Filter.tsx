
import { Search, } from 'lucide-react';

export interface TopFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    typeFilter: string;
    setTypeFilter: (type: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

export const RoomServiceTopFilter: React.FC<TopFilterProps> = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    sortBy,
    setSortBy,
}) => {
    return (

        <div className="p-4 rounded-xl border border-border bg-card space-y-3 ">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

                <div className="relative w-full lg:w-80">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search room #, guest name, or order ID..."
                        className="w-120 h-10 pl-9 pr-3 py-2 text-sm font-semibold rounded-(--radius) border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>


                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 text-sm font-medium rounded-(--radius) border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>


                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 text-sm font-medium rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">All Request Types</option>
                        <option value="Food">Food & Meals</option>
                        <option value="Drinks">Drinks & Beverages</option>
                        <option value="Essentials">Toiletries & Housekeeping</option>
                    </select>


                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 text-sm font-medium rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="newest">Sort by: Newest First</option>
                        <option value="oldest">Sort by: Oldest First</option>
                    </select>
                </div>

            </div>
        </div>
    );
};