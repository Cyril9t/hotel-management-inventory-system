import React, { useState, useMemo } from 'react';
import { IssueStockHeader } from './IssueStockHeader';
import { RequisitionMetadataForm, type RequisitionFormData } from './RequisitionMetadataForm';
import { IssuedItemsTable, type IssuedLineItem } from './issueTable';
import { IssueStockSummaryCard } from './IssueStockSummaryCard';

// Available product catalog in Main Store
const AVAILABLE_CATALOG = [
    { name: 'Maltina 33cl Can', mainStore: 85, unitCost: 1200, unit: 'pcs', category: 'Drinks' },
    { name: 'Heineken 60cl Bottle', mainStore: 120, unitCost: 1850, unit: 'btls', category: 'Drinks' },
    { name: 'Jasmine Long Grain Rice', mainStore: 50, unitCost: 28000, unit: 'kg', category: 'Food' },
    { name: 'Fresh Chicken Breast', mainStore: 40, unitCost: 4500, unit: 'kg', category: 'Food' },
    { name: 'Vegetable Cooking Oil', mainStore: 18, unitCost: 14000, unit: 'btls', category: 'Food' },
    { name: 'Luxury Bath Towels', mainStore: 60, unitCost: 8500, unit: 'pcs', category: 'Essentials' },
];

const INITIAL_REQUISITION: RequisitionFormData = {
    targetDepartment: 'Bar & Lounge',
    requestedBy: 'Bartender Bola Yusuf',
    authorizedBy: 'Chinedu Eze (Store Manager)',
    issueReason: 'Standard Daily Restock',
};

const INITIAL_ITEMS: IssuedLineItem[] = [
    {
        id: 'iss-line-1',
        productName: 'Maltina 33cl Can',
        category: 'Drinks',
        unitOfMeasure: 'pcs',
        mainStoreAvailable: 85,
        deptCurrentBalance: 10,
        qtyToIssue: 20,
        unitCost: 1200,
        totalCost: 24000,
    },
    {
        id: 'iss-line-2',
        productName: 'Heineken 60cl Bottle',
        category: 'Drinks',
        unitOfMeasure: 'btls',
        mainStoreAvailable: 120,
        deptCurrentBalance: 15,
        qtyToIssue: 40,
        unitCost: 1850,
        totalCost: 74000,
    },
];

export const IssueStockModule: React.FC<{ onBackToDashboard?: () => void }> = ({
    onBackToDashboard = () => console.log('Navigate to Store Dashboard'),
}) => {
    const [voucherNumber] = useState<string>('ISS-2026-0412');
    const [requisitionForm, setRequisitionForm] = useState<RequisitionFormData>(INITIAL_REQUISITION);
    const [items, setItems] = useState<IssuedLineItem[]>(INITIAL_ITEMS);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Form Field Change Handlers
    const handleMetadataChange = (field: keyof RequisitionFormData, value: string) => {
        setRequisitionForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddItem = () => {
        const newItem: IssuedLineItem = {
            id: `iss-line-${Date.now()}`,
            productName: '',
            category: 'General',
            unitOfMeasure: 'pcs',
            mainStoreAvailable: 0,
            deptCurrentBalance: 0,
            qtyToIssue: 1,
            unitCost: 0,
            totalCost: 0,
        };
        setItems((prev) => [...prev, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length > 1) {
            setItems((prev) => prev.filter((item) => item.id !== id));
        }
    };

    const handleUpdateItem = (id: string, field: keyof IssuedLineItem, value: any) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };
                    if (field === 'qtyToIssue' || field === 'unitCost') {
                        updated.totalCost = updated.qtyToIssue * updated.unitCost;
                    }
                    return updated;
                }
                return item;
            })
        );
    };

    // Calculations & Validation
    const summary = useMemo(() => {
        const totalQuantity = items.reduce((acc, item) => acc + (item.qtyToIssue || 0), 0);
        const totalValuation = items.reduce((acc, item) => acc + (item.qtyToIssue * item.unitCost || 0), 0);
        const hasErrors = items.some((item) => item.qtyToIssue > item.mainStoreAvailable || item.qtyToIssue <= 0);

        return {
            totalLineItems: items.length,
            totalQuantity,
            totalValuation,
            hasErrors,
        };
    }, [items]);

    const handleSubmitIssue = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert(`Transfer voucher ${voucherNumber} successfully posted to ${requisitionForm.targetDepartment}!`);
            onBackToDashboard();
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <IssueStockHeader
                    voucherNumber={voucherNumber}
                    onBackToDashboard={onBackToDashboard}
                    onResetForm={() => setItems(INITIAL_ITEMS)}
                    isSubmitting={isSubmitting}
                />

                {/* Requisition Authorization Form */}
                <RequisitionMetadataForm
                    formData={requisitionForm}
                    onChange={handleMetadataChange}
                />

                {/* Main Content Grid: Item Line Table + Transfer Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Item Table (2 Columns) */}
                    <div className="lg:col-span-2">
                        <IssuedItemsTable
                            items={items}
                            availableProducts={AVAILABLE_CATALOG}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            onUpdateItem={handleUpdateItem}
                        />
                    </div>

                    {/* Transfer Summary Panel (1 Column) */}
                    <div>
                        <IssueStockSummaryCard
                            totalLineItems={summary.totalLineItems}
                            totalQuantity={summary.totalQuantity}
                            totalValuation={summary.totalValuation}
                            targetDepartment={requisitionForm.targetDepartment}
                            requestedBy={requisitionForm.requestedBy}
                            hasErrors={summary.hasErrors}
                            onSubmit={handleSubmitIssue}
                            isSubmitting={isSubmitting}
                        />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default IssueStockModule;