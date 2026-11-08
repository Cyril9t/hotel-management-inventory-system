import React from 'react';
import { Building2, UserCheck, ShieldCheck, ClipboardList } from 'lucide-react';

export interface RequisitionFormData {
    targetDepartment: string;
    requestedBy: string;
    authorizedBy: string;
    issueReason: string;
    remarks?: string;
}

export interface RequisitionFormProps {
    formData: RequisitionFormData;
    onChange: (field: keyof RequisitionFormData, value: string) => void;
}

export const RequisitionMetadataForm: React.FC<RequisitionFormProps> = ({
    formData,
    onChange,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Department Requisition Authorization</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Target Department */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span>Target Department</span>
                    </label>
                    <select
                        value={formData.targetDepartment}
                        onChange={(e) => onChange('targetDepartment', e.target.value)}
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="Bar & Lounge">Bar & Lounge</option>
                        <option value="Kitchen">Kitchen</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Front Office / Reception">Front Office / Reception</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>

                {/* Requested By (Staff) */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-primary" />
                        <span>Requested By (Staff Name)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.requestedBy}
                        onChange={(e) => onChange('requestedBy', e.target.value)}
                        placeholder="e.g. Chef Tolu Adeyemi"
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Authorized By (Store Manager) */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        <span>Authorized By (Store Officer)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.authorizedBy}
                        onChange={(e) => onChange('authorizedBy', e.target.value)}
                        placeholder="e.g. Chinedu Eze (Store Manager)"
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Purpose / Issue Reason */}
                <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5 text-primary" />
                        <span>Transfer Reason</span>
                    </label>
                    <select
                        value={formData.issueReason}
                        onChange={(e) => onChange('issueReason', e.target.value)}
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="Standard Daily Restock">Standard Daily Restock</option>
                        <option value="Special Banquet / Event Prep">Special Banquet / Event Prep</option>
                        <option value="Damaged / Replacement Issue">Damaged / Replacement Issue</option>
                        <option value="Emergency Restock">Emergency Restock</option>
                    </select>
                </div>
            </div>
        </div>
    );
};