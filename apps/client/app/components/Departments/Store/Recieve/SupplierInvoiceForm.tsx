import React from 'react';
import { Truck, FileText, Calendar, Building2 } from 'lucide-react';

export interface SupplierFormData {
    supplierName: string;
    invoiceRef: string;
    deliveryDate: string;
    storageLocation: string;
    notes?: string;
}

export interface SupplierFormProps {
    formData: SupplierFormData;
    onChange: (field: keyof SupplierFormData, value: string) => void;
}

export const SupplierInvoiceForm: React.FC<SupplierFormProps> = ({ formData, onChange }) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Truck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Supplier & Delivery Metadata</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Supplier / Vendor */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span>Supplier / Vendor</span>
                    </label>
                    <select
                        value={formData.supplierName}
                        onChange={(e) => onChange('supplierName', e.target.value)}
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">Select Vendor...</option>
                        <option value="Guinness Nigeria PLC">Guinness Nigeria PLC</option>
                        <option value="Nigerian Breweries PLC">Nigerian Breweries PLC</option>
                        <option value="Grand Foods Ltd">Grand Foods Ltd</option>
                        <option value="Chi Limited">Chi Limited</option>
                        <option value="General Hotel Supplies Ltd">General Hotel Supplies Ltd</option>
                    </select>
                </div>

                {/* Invoice / Delivery Note # */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span>Waybill / Invoice Ref #</span>
                    </label>
                    <input
                        type="text"
                        value={formData.invoiceRef}
                        onChange={(e) => onChange('invoiceRef', e.target.value)}
                        placeholder="e.g. INV-2026-9901"
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-mono font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Date Received */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>Delivery Date</span>
                    </label>
                    <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => onChange('deliveryDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Destination Location */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span>Storage Location</span>
                    </label>
                    <select
                        value={formData.storageLocation}
                        onChange={(e) => onChange('storageLocation', e.target.value)}
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="Main Central Store">Main Central Store</option>
                        <option value="Cold Room / Chiller 1">Cold Room / Chiller 1</option>
                        <option value="Bar Holding Cellar">Bar Holding Cellar</option>
                        <option value="Kitchen Dry Store">Kitchen Dry Store</option>
                    </select>
                </div>
            </div>
        </div>
    );
};