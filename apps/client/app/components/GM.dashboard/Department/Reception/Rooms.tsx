import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ConciergeBell, Utensils, Package, Wine, CookingPot } from "lucide-react";
import { UseMetricCards } from "~/Context/Context";
import { RoomsProvider } from "~/Context/RoomsContext";
import AvailableRoomsPage from "~/components/Departments/Reception/Rooms/AvailableRooms";
import { DepartmentCard, type Department } from "../Department";
import { DepartmentDetailView } from "./DepartmentDetailView";
import { HotelDepartmentsHeader } from "./header";

const departments: Department[] = [
    {
        name: "Reception",
        code: "FRONT OFFICE",
        summary: "Guest check-in and checkout, reservations, room assignments, and front desk support.",
        icon: ConciergeBell,
        accent: "bg-primary/10 text-primary border border-primary/20",
    },
    {
        name: "Restaurant",
        code: "FOOD & BEVERAGE",
        summary: "Restaurant service, dining room operations, and guest orders.",
        icon: Utensils,
        accent: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    },
    {
        name: "Kitchen",
        code: "FOOD PRODUCTION",
        summary: "Meal preparation, kitchen operations, and food safety.",
        icon: CookingPot,
        accent: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
    },
    {
        name: "Bar",
        code: "FOOD & BEVERAGE",
        summary: "Beverage service, bar stock, and guest orders.",
        icon: Wine,
        accent: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
    },
    {
        name: "Store Manager",
        code: "STORE MANAGEMENT",
        summary: "Central hotel inventory and stock distribution to departments.",
        icon: Package,
        accent: "bg-sky-500/10 text-sky-400 border border-sky-500/20"
    },
];

function RoomsPageWithProvider(props: { onCreateRoom?: () => void; refreshKey?: number }) {
    return <RoomsProvider><AvailableRoomsPage {...props} allowRoomActions={false} /></RoomsProvider>;
}

function normalizeDeptQuery(value: string | null): string {
    if (!value) return "";
    return value.toLowerCase().trim().replace(/[_\s]+/g, "-");
}

function findDepartmentByQuery(query: string | null): Department | null {
    const normalized = normalizeDeptQuery(query);
    if (!normalized) return null;
    return departments.find((d) => normalizeDeptQuery(d.name) === normalized) ?? null;
}

export function HotelDepartments() {
    const { api } = UseMetricCards();
    const [searchParams, setSearchParams] = useSearchParams();

    const deptQuery = searchParams.get("department") || searchParams.get("dept");

    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(() =>
        findDepartmentByQuery(deptQuery)
    );
    const [roomsRefreshKey, setRoomsRefreshKey] = useState(0);

    useEffect(() => {
        const matched = findDepartmentByQuery(deptQuery);
        setSelectedDepartment(matched);
    }, [deptQuery]);

    const handleSelectDepartment = useCallback((department: Department) => {
        setSelectedDepartment(department);
        setSearchParams({ department: normalizeDeptQuery(department.name) });
    }, [setSearchParams]);

    const handleBack = useCallback(() => {
        setSelectedDepartment(null);
        setSearchParams({});
    }, [setSearchParams]);

    const handleRoomCreated = useCallback(() => {
        setRoomsRefreshKey((current) => current + 1);
    }, []);

    // Detail View Selected State
    if (selectedDepartment) {
        return (
            <DepartmentDetailView
                department={selectedDepartment}
                onBack={handleBack}
                RoomsPage={RoomsPageWithProvider}
                roomDialogOpen={roomDialogOpen}
                setRoomDialogOpen={setRoomDialogOpen}
                roomsRefreshKey={roomsRefreshKey}
                handleRoomCreated={handleRoomCreated}
                api={api}
            />
        );
    }

    // Default Grid View
    return (
        <div className="space-y-6">
            <HotelDepartmentsHeader departmentCount={departments.length} />

            <section aria-label="Hotel departments" className="space-y-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">All departments</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Choose a department to view its workspace.</p>
                </div>
                <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {departments.map((department) => (
                    <DepartmentCard
                        key={department.name}
                        department={department}
                        onSelect={handleSelectDepartment}
                    />
                ))}
                </div>
            </section>

            {departments.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
                    <p className="font-medium text-foreground">No departments to display</p>
                    <p className="mt-1 text-sm text-muted-foreground">Department workspaces will appear here when they are available.</p>
                </div>
            )}

            <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Select a department card to open its workspace. Reception includes room and category management.
            </div>

        </div>
    );
}

export default HotelDepartments;
