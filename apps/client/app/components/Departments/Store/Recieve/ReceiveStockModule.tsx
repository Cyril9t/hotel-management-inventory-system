import React, { useState, useMemo } from 'react';
import { ReceiveStockHeader } from './ReceiveStockHeader';
import { SupplierInvoiceForm, type SupplierFormData } from './SupplierInvoiceForm';
import { ReceivedItemsTable, type ReceivedLineItem } from './ReceivedItemsTable';
import { ReceiveStockSummaryCard } from './ReceiveStockSummaryCard.';

const INITIAL_SUPPLIER_FORM: SupplierFormData = {
    supplierName: 'Guinness Nigeria PLC',
    invoiceRef: 'INV-2026-8841',
    deliveryDate: new Date().toISOString().split('T')[0],
    storageLocation: 'Main Central Store',
};

const INITIAL_ITEMS: ReceivedLineItem[] = [
    {
        id: 'line-1',
        productName: 'Heineken 60cl Bottle',
        category: 'Drinks',
        unitOfMeasure: 'Crates (24 btls)',
        qtyReceived: 10,
        unitCost: 18500,
        totalCost: 185000,
        expiryDate: '2027-08-30',
    },
    {
        id: 'line-2',
        productName: 'Maltina 33cl Can',
        category: 'Drinks',
        unitOfMeasure: 'Packs (24 cans)',
        qtyReceived: 15,
        unitCost: 12000,
        totalCost: 180000,
        expiryDate: '2027-04-15',
    },
];

export const ReceiveStockModule: React.FC<{ onBackToDashboard?: () => void }> = ({
    onBackToDashboard = () => console.log('Navigate to Store Dashboard'),
}) => {
    const [grnNumber] = useState<string>('GRN-2026-1049');
    const [supplierForm, setSupplierForm] = useState<SupplierFormData>(INITIAL_SUPPLIER_FORM);
    const [items, setItems] = useState<ReceivedLineItem[]>(INITIAL_ITEMS);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Form Field Change Handlers
    const handleSupplierChange = (field: keyof SupplierFormData, value: string) => {
        setSupplierForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddItem = () => {
        const newItem: ReceivedLineItem = {
            id: `line-${Date.now()}`,
            productName: '',
            category: 'General',
            unitOfMeasure: 'Pcs',
            qtyReceived: 1,
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

    const handleUpdateItem = (id: string, field: keyof ReceivedLineItem, value: any) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };
                    if (field === 'qtyReceived' || field === 'unitCost') {
                        updated.totalCost = updated.qtyReceived * updated.unitCost;
                    }
                    return updated;
                }
                return item;
            })
        );
    };

    // Financial Summary Computations
    const summary = useMemo(() => {
        const totalQuantity = items.reduce((acc, item) => acc + (item.qtyReceived || 0), 0);
        const subtotalCost = items.reduce((acc, item) => acc + (item.qtyReceived * item.unitCost || 0), 0);
        const taxAmount = Math.round(subtotalCost * 0.075);
        const grandTotalCost = subtotalCost + taxAmount;

        return {
            totalLineItems: items.length,
            totalQuantity,
            subtotalCost,
            taxAmount,
            grandTotalCost,
        };
    }, [items]);

    const handleSubmitGRN = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert(`Goods Received Note ${grnNumber} posted successfully to inventory!`);
            onBackToDashboard();
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <ReceiveStockHeader
                    grnNumber={grnNumber}
                    onBackToDashboard={onBackToDashboard}
                    onResetForm={() => setItems(INITIAL_ITEMS)}
                    isSubmitting={isSubmitting}
                />

                {/* Supplier & Delivery Form */}
                <SupplierInvoiceForm
                    formData={supplierForm}
                    onChange={handleSupplierChange}
                />

                {/* Main Grid: Item Table + Summary Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Table (2 Columns) */}
                    <div className="lg:col-span-2">
                        <ReceivedItemsTable
                            items={items}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            onUpdateItem={handleUpdateItem}
                        />
                    </div>

                    {/* Cost Valuation Summary (1 Column) */}
                    <div>
                        <ReceiveStockSummaryCard
                            totalLineItems={summary.totalLineItems}
                            totalQuantity={summary.totalQuantity}
                            subtotalCost={summary.subtotalCost}
                            taxAmount={summary.taxAmount}
                            grandTotalCost={summary.grandTotalCost}
                            onSubmit={handleSubmitGRN}
                            isSubmitting={isSubmitting}
                        />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ReceiveStockModule;