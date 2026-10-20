import React from 'react';
import { FileText } from 'lucide-react';

export interface ShiftNotesProps {
    notes: string;
    onNotesChange: (val: string) => void;
    quickChips?: string[];
}

export const ShiftNotesForm: React.FC<ShiftNotesProps> = ({
    notes,
    onNotesChange,
    quickChips = [
        'Drawer verified and balanced',
        'POS terminal batch settled',
        'Shortage noted for management',
        'Handover completed to night auditor',
    ],
}) => {
    const addChipToNotes = (chip: string) => {
        if (!notes.trim()) {
            onNotesChange(chip);
        } else {
            onNotesChange(`${notes}. ${chip}`);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 mt-10">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Shift Handover Notes
            </h3>


            <div className="flex flex-wrap gap-1.5">
                {quickChips.map((chip, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => addChipToNotes(chip)}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-border bg-secondary/50 hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                        + {chip}
                    </button>
                ))}
            </div>

            <textarea
                rows={3}
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add operational notes, incident reports, or handover instructions..."
                className="w-full p-3 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
        </div>
    );
};