import React from "react";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Button } from "~/components/ui/button";
import RoomCreateDialog from "../CreateRoomDialog";
import type { Department } from "../Department";
import { StoreManagerView } from "../Store/StoreManagerView";

interface DepartmentDetailViewProps {
    department: Department;
    onBack: () => void;
    RoomsPage: React.FC<{ onCreateRoom?: () => void; refreshKey?: number }>;
    roomDialogOpen: boolean;
    setRoomDialogOpen: (open: boolean) => void;
    roomsRefreshKey: number;
    handleRoomCreated: () => void;
    api: any;
}

export const DepartmentDetailView: React.FC<DepartmentDetailViewProps> = ({
    department,
    onBack,
    RoomsPage,
    roomDialogOpen,
    setRoomDialogOpen,
    roomsRefreshKey,
    handleRoomCreated,
    api,
}) => {
    const Icon = department.icon;
    const isReception = department.name === "Reception";
    const isStoreManager = department.name === "Store Manager";

    return (
        <div className="space-y-6">
            <div className="flex items-center border-b border-border/70 pb-4">
                <Button variant="outline" size="sm" className="gap-2" onClick={onBack}>
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Back to departments
                </Button>
            </div>

            {isReception ? (
                <RoomsPage onCreateRoom={() => setRoomDialogOpen(true)} refreshKey={roomsRefreshKey} />
            ) : isStoreManager ? (
                <StoreManagerView department={department} />
            ) : (
                <section className="mx-auto w-full max-w-4xl rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-9">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${department.accent}`}>
                            <Icon aria-hidden="true" className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{department.code}</p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                {department.name}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {department.summary}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/35 px-5 py-8 sm:px-8">
                        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                                <Clock3 aria-hidden="true" className="h-5 w-5" />
                            </div>
                            <h2 className="mt-4 text-base font-semibold text-foreground">
                                Department workspace
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                This department workspace is not available yet. Its current overview is shown above.
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {isReception && (
                <RoomCreateDialog
                    api={api}
                    open={roomDialogOpen}
                    onOpenChange={setRoomDialogOpen}
                    onCreated={handleRoomCreated}
                />
            )}
        </div>
    );
};
