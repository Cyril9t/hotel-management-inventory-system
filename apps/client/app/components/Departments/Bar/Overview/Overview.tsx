import { useState } from 'react';
import { BarDrinksStockTable, type StockItem } from './Table';
import { BarMetricsGrid } from './MetricCard';
import { BarQuickActionsCard } from './QuickActions';


const stockItems: StockItem[] = [
    {
        id: '1',
        name: 'Heineken',
        quantityReceived: 40,
        sold: -10,
        availableText: '30 bottles',
    },
    {
        id: '2',
        name: 'Champion',
        quantityReceived: 3,
        sold: 24,
        availableText: '32,000',
        valuation: 32000,
    },
    {
        id: '3',
        name: 'Star Raddler',
        quantityReceived: 1,
        sold: 59,
        availableText: '12,000',
        valuation: 12000,
    },
];

function Overview() {
    return (

        <div >


            <BarMetricsGrid
                totalSales={482750}
                totalOrders={24}
                totalStocks={40}
            />


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">


                <div className="lg:col-span-2">
                    <BarDrinksStockTable
                        items={stockItems}
                        onViewAllHistory={() => console.log('Navigate to full stock history')}
                    />
                </div>


                <div>
                    <BarQuickActionsCard
                        onNewOrder={() => console.log('Trigger New Order Modal')}
                        onMakePayment={() => console.log('Trigger Payment Modal')}
                        onViewMenu={() => console.log('Navigate to Menu')}
                        onSalesReport={() => console.log('Navigate to Sales Report')}
                    />
                </div>

            </div>

        </div>

    );
}

export default Overview;
