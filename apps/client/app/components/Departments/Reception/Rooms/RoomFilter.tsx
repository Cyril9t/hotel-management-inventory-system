import { Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";


interface RoomFiltersBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    selectedType: string;
    setSelectedType: (type: string) => void;
    totalCount: number;
    availableCount: number;
    occupiedCount: number;
    checkoutDueCount: number;
    overdueCount: number;
    onNewBooking: () => void;
}

export const RoomFiltersBar: React.FC<RoomFiltersBarProps> = ({
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedType,
    setSelectedType,
    totalCount,
    availableCount,
    occupiedCount,
    checkoutDueCount,
    overdueCount,
    onNewBooking,
}) => {
    const tabs = [
        { label: 'All Rooms', value: 'All', count: totalCount },
        { label: 'Available', value: 'Available', count: availableCount },
        { label: 'Occupied', value: 'Occupied', count: occupiedCount },
        { label: 'Checkout Due', value: 'Checkout Due', count: checkoutDueCount },
        { label: 'Overdue', value: 'Overdue', count: overdueCount },
    ];

    return (
        <div className="space-y-4 mt-6">

            <div className="flex flex-col md:flex-row items-center justify-between gap-3">

                <div className="relative w-full md:w-100">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search room number, guest name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full  pl-9 pr-4 py-2 text-sm rounded-lg bg-card border border-input text-foreground placeholder:text-[14px] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-2 py-2 text-sm font-medium rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer flex-1 md:flex-none"
                    >
                        <option value="All">All Room Types</option>
                        <option value="Standard Room">Standard Room</option>
                        <option value="Deluxe Room">Deluxe Room</option>
                        <option value="Premium Room">Premium Room</option>
                        <option value="Executive Suite">Executive Suite</option>
                    </select>


                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 text-sm font-medium rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer flex-1 md:flex-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Checkout Due">Checkout Due</option>
                        <option value="Overdue">Overdue</option>
                    </select>


                    {/* <Button

                        onClick={onNewBooking}
                        className="h-9 bg-brand-navy text-background "
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Booking</span>
                    </Button> */}
                </div>
            </div>


            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mt-7">
                {tabs.map((tab) => {
                    const isActive = selectedStatus === tab.value;
                    return (
                        <button


                            key={tab.value}
                            onClick={() => setSelectedStatus(tab.value)}

                            className={`px-3.5 py-2 border-b-2 w-40 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${isActive
                                ? 'text-background bg-brand-navy-light'
                                : ' text-muted-foreground hover:text-primary'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

