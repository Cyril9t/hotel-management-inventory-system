import { useCallback, useState, type KeyboardEvent } from "react";
import { Building2, ConciergeBell, Utensils, Package, Wine, Info } from "lucide-react";
import { UseMetricCards } from "~/Context/Context";
import RoomCreateDialog from "../CreateRoomDialog";
import AvailableRoomsPage from "~/components/Departments/Reception/Rooms/AvailableRooms";
import { DepartmentCard, type Department } from "../Department";
import { DepartmentDetailView } from "./DepartmentDetailView";
import { HotelDepartmentsHeader } from "./header";

const initialDepartments: Department[] = [
    {
        name: "Reception",
        code: "FRONT OFFICE",
        staff: 8,
        summary: "Guest check-in and checkout, reservations, room assignments, and front desk support.",
        lead: "Amina Bello",
        shift: "24-hour coverage",
        icon: ConciergeBell,
        accent: "bg-primary/10 text-primary border border-primary/20",
        rooms: 24
    },
    {
        name: "Restaurant",
        code: "FOOD & BEVERAGE",
        staff: 9,
        summary: "Restaurant service, dining room operations, and guest orders.",
        lead: "Emeka Nwosu",
        shift: "Breakfast to dinner",
        icon: Utensils,
        accent: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    },
    {
        name: "Kitchen",
        code: "FOOD PRODUCTION",
        staff: 7,
        summary: "Meal preparation, kitchen operations, and food safety.",
        lead: "Tolu Adeyemi",
        shift: "Morning & evening",
        icon: Utensils,
        accent: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
    },
    {
        name: "Bar",
        code: "FOOD & BEVERAGE",
        staff: 4,
        summary: "Beverage service, bar stock, and guest orders.",
        lead: "Bola Yusuf",
        shift: "Afternoon to late",
        icon: Wine,
        accent: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
    },
    {
        name: "Store",
        code: "INVENTORY",
        staff: 3,
        summary: "Hotel supplies, inventory records, and department requests.",
        lead: "Chinedu Eze",
        shift: "Day shift",
        icon: Package,
        accent: "bg-sky-500/10 text-sky-400 border border-sky-500/20"
    },
];

export function HotelDepartments() {
    const { api } = UseMetricCards();
    const RoomsPage = (props: { onCreateRoom?: () => void; refreshKey?: number }) => (
        <AvailableRoomsPage {...props} allowRoomActions={false} />
    );

    const [departments, setDepartments] = useState(initialDepartments);
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [roomsRefreshKey, setRoomsRefreshKey] = useState(0);

    const totalStaff = departments.reduce((total, department) => total + department.staff, 0);

    const handleRoomCreated = useCallback(() => {
        setDepartments((current) =>
            current.map((department) =>
                department.name === "Reception"
                    ? { ...department, rooms: (department.rooms ?? 0) + 1 }
                    : department
            )
        );
        setRoomsRefreshKey((current) => current + 1);
    }, []);

    const handleDepartmentKeyDown = (
        event: KeyboardEvent<HTMLDivElement>,
        department: Department
    ) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedDepartment(department);
        }
    };

    // Detail View Selected State
    if (selectedDepartment) {
        return (
            <DepartmentDetailView
                department={selectedDepartment}
                onBack={() => setSelectedDepartment(null)}
                RoomsPage={RoomsPage}
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
            <HotelDepartmentsHeader totalStaff={totalStaff} />

            {/* Departments Grid */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {departments.map((department) => (
                    <DepartmentCard
                        key={department.name}
                        department={department}
                        onSelect={setSelectedDepartment}
                        onKeyDown={handleDepartmentKeyDown}
                    />
                ))}
            </div>

            {/* Operational Disclaimer Notice Banner */}
            <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/40 p-4 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed">
                    Team sizes, department leads, and coverage schedules shown here are sample figures. To add a reception room, first create a category with its nightly price or select an existing category, then enter the room number.
                </p>
            </div>

            {/* Room Creation Modal */}
            <RoomCreateDialog
                api={api}
                open={roomDialogOpen}
                onOpenChange={setRoomDialogOpen}
                onCreated={handleRoomCreated}
            />
        </div>
    );
}

export default HotelDepartments;