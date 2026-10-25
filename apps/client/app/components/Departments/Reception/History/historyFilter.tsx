import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '~/components/ui/button';

export interface FilterProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

export const tabs = [
    { id: 'all', label: 'All Activities' },
    { id: 'checkin', label: 'Check-ins' },
    { id: 'checkout', label: 'Check-outs' },
    { id: 'booking', label: 'Bookings' },
    { id: 'roomservice', label: 'Room Service' },
    { id: 'payment', label: 'Payments' },
    { id: 'shift', label: 'Shift Handover' },
];

export const HistoryFilterBar: React.FC<FilterProps> = ({
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedDate,
    setSelectedDate,
}) => {
    return (
        <div className="space-y-4">

            <div className="flex items-center gap-2 overflow-x-auto pb-7 border-b border-border/60 scrollbar-none mt-6   ">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-2 text-sm font-semibold rounded-[12px] whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>


            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">

                <div className="relative w-full sm:w-80">
                    <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search guest, room #, ref, or staff..."
                        className="w-100 pl-9 pr-3 py-3 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>


                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-9 pr-3 py-3 text-sm rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};