import React, { useState, useMemo } from 'react';
import { StoreManagerHeader } from './StoreManagerHeader';
import { StoreMetricsGrid } from './StoreMetricsGrid';
import { LowStockAlertsCard, type AlertItem } from './LowStockAlertsCard';
import { DepartmentStockLedgerTable, type LedgerItem } from './DepartmentStockLedgerTable';

// ==========================================
// MOCK DATA SETUP
// ==========================================
const MOCK_LOW_STOCK_ALERTS: AlertItem[] = [
    { id: 'a1', name: 'Fresh Tomatoes', qtyText: '2 pcs' },
    { id: 'a2', name: 'Chicken Breast', qtyText: '4 pcs' },
    { id: 'a3', name: 'Cooking Oil', qtyText: '1 bottle' },
    { id: 'a4', name: 'Paper Towels', qtyText: '3 packs' },
    { id: 'a5', name: 'Detergent', qtyText: '2 packs' },
];

const MOCK_LEDGER_ITEMS: LedgerItem[] = [
    {
        id: 'l1',
        name: 'Malt',
        department: 'Bar & Lounge',
        mainStore: '85 pcs',
        issuedToDept: '20 pcs',
        availableInDept: '10 pcs',
        status: 'OK',
    },
    {
        id: 'l2',
        name: 'Rice',
        department: 'Kitchen',
        mainStore: '50 kg',
        issuedToDept: '25 kg',
        availableInDept: '12 kg',
        status: 'OK',
    },
    {
        id: 'l3',
        name: 'Chicken Breast',
        department: 'Kitchen',
        mainStore: '40 kg',
        issuedToDept: '26 kg',
        availableInDept: '4 pcs',
        status: 'Low',
    },
    {
        id: 'l4',
        name: 'Budweiser',
        department: 'Bar & Lounge',
        mainStore: '120 btls',
        issuedToDept: '40 btls',
        availableInDept: '15 btls',
        status: 'OK',
    },
    {
        id: 'l5',
        name: 'Fresh Tomatoes',
        department: 'Kitchen',
        mainStore: '15 kg',
        issuedToDept: '12 kg',
        availableInDept: '2 pcs',
        status: 'Low',
    },
    {
        id: 'l6',
        name: 'Cooking Oil',
        department: 'Restaurant',
        mainStore: '18 btls',
        issuedToDept: '14 btls',
        availableInDept: '1 bottle',
        status: 'Low',
    },
];

export const StoreManagerDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>(MOCK_LEDGER_ITEMS);

    // Filtered Ledger Items
    const filteredLedger = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return ledgerItems;
        return ledgerItems.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.department.toLowerCase().includes(query)
        );
    }, [ledgerItems, searchTerm]);

    // Actions
    const handleReceiveStock = (item?: LedgerItem) => {
        alert(`Trigger "Receive Stock" modal ${item ? `for ${item.name}` : ''}`);
    };

    const handleIssueStock = (item?: LedgerItem) => {
        alert(`Trigger "Issue to Department" modal ${item ? `for ${item.name}` : ''}`);
    };

    return (
        <div className="">
            <div className="">


                <StoreManagerHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onReceiveStock={() => handleReceiveStock()}
                    onIssueStock={() => handleIssueStock()}
                />


                <StoreMetricsGrid
                    healthPercentage={82}
                    lowCount={12}
                    critCount={6}
                    totalItems={256}
                    newItemsCount={12}
                    lowStockTotal={8}
                    receivedToday={18}
                    deliveriesCount={3}
                />


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">


                    <div>
                        <LowStockAlertsCard items={MOCK_LOW_STOCK_ALERTS} />
                    </div>


                    <div className="lg:col-span-2">
                        <DepartmentStockLedgerTable
                            items={filteredLedger}
                            onReceiveItem={handleReceiveStock}
                            onIssueItem={handleIssueStock}
                            onViewAllLedger={() => alert('Navigating to full inventory ledger history')}
                        />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StoreManagerDashboard;