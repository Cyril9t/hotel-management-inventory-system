import React from 'react';
import { ArrowLeft, PackagePlus, RotateCcw, Save } from 'lucide-react';

export interface HeaderProps {
    grnNumber: string;
    onBackToDashboard: () => void;
    onResetForm: () => void;
    isSubmitting?: boolean;
}

export const ReceiveStockHeader: React.FC<HeaderProps> = ({
    grnNumber,
    onBackToDashboard,
    onResetForm,
    isSubmitting = false,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBackToDashboard}
                        className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Store Dashboard</span>
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        Goods Received Note
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl   font-bold tracking-tight text-foreground">
                        Receive New Stock
                    </h1>
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-secondary text-primary rounded-md border border-border">
                        GRN: {grnNumber}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onResetForm}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card hover:bg-secondary text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                    <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Reset Form</span>
                </button>
            </div>
        </div>
    );
};