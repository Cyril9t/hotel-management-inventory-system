
import { Lock, ShieldCheck } from 'lucide-react';
import { CloseShiftHeader } from './header';
import { ShiftReconciliationCard } from './shiftCard';
import { PaymentBreakdownCard } from './paymentSats';
import { ShiftNotesForm } from './note';
import { replace, useNavigate } from 'react-router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { UseMetricCards } from '~/Context/Context';

export interface CloseShiftContainerProps {
    isOpen?: boolean;
    onClose?: () => void;
    onShiftClosed?: (summary: any) => void;
}

export const CloseShift: React.FC<CloseShiftContainerProps> = ({
    isOpen = true,
    onClose,
    onShiftClosed,
}) => {

    const { clearSession } = UseMetricCards()
    const openingCash = 50000;

    const paymentBreakdown = {
        cash: 76500,
        card: 22000,
        transfer: 11800,
        roomCharges: 10000,
    };

    const totalRevenue =
        paymentBreakdown.cash +
        paymentBreakdown.card +
        paymentBreakdown.transfer +
        paymentBreakdown.roomCharges;

    const expectedCash = openingCash + paymentBreakdown.cash;

    const [actualCash, setActualCash] = useState<number>(expectedCash);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    if (!isOpen) return null;


    const navigate = useNavigate()

    const handleActualCashChange = (value: number) => {
        if (value > expectedCash) {
            setActualCash(expectedCash);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
        } else {
            setActualCash(value);
            setShowWarning(false);
        }
    };

    const variance = actualCash - expectedCash;

    const handleFinalClose = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearSession()
        setTimeout(() => {
            setIsSubmitting(false);

        }, 1200);

        navigate("/", { replace: true })

    };

    return (
        <div className="">
            <div className="">


                <CloseShiftHeader
                    staffName="Michael Carter"
                    department="General Management"
                    openedAt={`${new Date().toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short"
                    })} → 08:00 AM`}
                    closedAt={`${new Date().toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short"
                    })} → 09:00 PM`}
                    onClose={onClose}
                />

                <form onSubmit={handleFinalClose} className="flex-1 overflow-y-auto mt-10">

                    <div className="">
                        <ShiftReconciliationCard
                            openingCash={openingCash}
                            totalCashCollected={paymentBreakdown.cash}
                            expectedCash={expectedCash}
                            actualCash={actualCash}
                            variance={variance}
                            onActualCashChange={handleActualCashChange}
                            showWarning={showWarning}
                        />

                    </div>

                    <PaymentBreakdownCard
                        breakdown={paymentBreakdown}
                        totalRevenue={totalRevenue}
                    />

                    <ShiftNotesForm
                        notes={notes}
                        onNotesChange={setNotes}
                    />


                    <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            <span>Shift Reconciliation Audit Logged Automatically</span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-xs font-semibold rounded-[var(--radius)] border border-input bg-card text-foreground hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-50 h-10"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Closing Shift...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        <span>Confirm & Close Shift</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CloseShift;