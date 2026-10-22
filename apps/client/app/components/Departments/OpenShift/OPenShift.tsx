import { useState } from 'react';
import { Play, Lock } from 'lucide-react';
import { StaffIdentityCard } from './identityCard';
import { ShiftCashInputSection } from './OpeningFloat';
import OpenHeader from './OpenHeader';
import { Button } from '~/components/ui/button';
import { Navigate, NavLink, useNavigate } from 'react-router';
import Logo from '~/components/shared/Logo';


export interface OpenShiftPayload {
    staffName: string;
    department: string;
    role: string;
    openingCash: number;
    handoverAmount: number;
    timestamp: string;
    stockSnapshotAutoCaptured: boolean;
}

export interface OpenShiftContainerProps {
    onOpenShiftComplete?: (payload: OpenShiftPayload) => void;
    onCancel?: () => void;
}

export const OpenShiftContainer: React.FC<OpenShiftContainerProps> = ({
    onOpenShiftComplete,
    onCancel,
}) => {

    const currentUser = {
        staffName: "Michael Carter",
        department: "General Management",
        role: "Front Office Manager",
        openingTimestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    const [openingCash, setOpeningCash] = useState<number>(50000);
    const [handoverAmount, setHandoverAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


    const navigate = useNavigate()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload: OpenShiftPayload = {
            ...currentUser,
            openingCash,
            handoverAmount,
            timestamp: currentUser.openingTimestamp,
            stockSnapshotAutoCaptured: true,
        };

        setTimeout(() => {
            setIsSubmitting(false);
            if (onOpenShiftComplete) {
                onOpenShiftComplete(payload);
            }

        }, 1200);

        navigate("/reception/dashboard")



    };

    return (
        <div className="fixed inset-0 z-50 bg-[black]/30 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">

            <div className='text-[17.5em]'>
                <h1 className="font-bold tracking-wider font-serif textColor text-brand-navy">
                    BRANDY
                </h1>

            </div>
            <div className="absolute p-5 bg-card border border-border rounded-[var(--radius)] shadow-2xl overflow-hidden flex flex-col">

                <OpenHeader />

                <form onSubmit={handleSubmit} className="mt-10">


                    <StaffIdentityCard
                        staffName={currentUser.staffName}
                        department={currentUser.department}
                        role={currentUser.role}
                        openingTimestamp={currentUser.openingTimestamp}
                    />


                    <ShiftCashInputSection
                        openingCash={openingCash}
                        handoverAmount={handoverAmount}
                        onOpeningCashChange={setOpeningCash}
                        onHandoverChange={setHandoverAmount}
                    />


                    <div className="pt-4 border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                            <Lock className="w-3.5 h-3.5 text-primary" />
                            <span>Shift launch logs user identity & system timestamps</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {onCancel && (
                                <Button
                                    type="button"
                                    onClick={onCancel}
                                    className=""
                                >
                                    Cancel
                                </Button>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-10 w-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Launching Shift...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current" />
                                        <span>Open Shift</span>
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

export default OpenShiftContainer;