import React from "react";
import { ChevronLeft, Info } from "lucide-react";
import { Button } from "~/components/ui/button";
import RoomCreateDialog from "../CreateRoomDialog";
import type { Department } from "../Department";

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

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border bg-card text-foreground hover:bg-secondary transition-colors"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-4 w-4 text-primary" />
                    <span>Back to Departments</span>
                </Button>
            </div>

            {/* Main Detail Content */}
            {isReception ? (
                <RoomsPage
                    onCreateRoom={() => setRoomDialogOpen(true)}
                    refreshKey={roomsRefreshKey}
                />
            ) : (
                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl relative overflow-hidden">
                    <div className="flex items-start justify-between gap-4">
                        <div className={`rounded-xl p-4 ${department.accent}`}>
                            <Icon className="h-8 w-8" />
                        </div>
                        <span className="rounded-full bg-secondary px-3.5 py-1 text-xs font-mono font-bold text-primary">
                            {department.code}
                        </span>
                    </div>

                    <div className="mt-6 space-y-2">
                        <h1 className="text-3xl font-serif font-bold text-foreground">
                            {department.name}
                        </h1>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            {department.summary}
                        </p>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/60 pt-6 text-xs">
                        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Team Lead</span>
                            <p className="text-sm font-bold text-foreground mt-0.5">{department.lead}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Team Size</span>
                            <p className="text-sm font-bold text-foreground mt-0.5">{department.staff} Active Staff</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Shift Schedule</span>
                            <p className="text-sm font-bold text-foreground mt-0.5">{department.shift}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Creation Modal Dialog */}
            <RoomCreateDialog
                api={api}
                open={roomDialogOpen}
                onOpenChange={setRoomDialogOpen}
                onCreated={handleRoomCreated}
            />
        </div>
    );
};