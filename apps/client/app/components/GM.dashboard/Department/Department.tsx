import { useCallback, useState, type KeyboardEvent } from "react";
import { BedDouble, Building2, ConciergeBell, Utensils, Package, Wine, Users, ArrowUpRight, ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import { UseMetricCards } from "~/Context/Context";
import RoomCreateDialog from "./CreateRoomDialog";
import AvailableRoomsPage from "~/components/Departments/Reception/Rooms/AvailableRooms";

type Department = { name: string; code: string; staff: number; summary: string; lead: string; shift: string; icon: typeof Building2; accent: string; rooms?: number };


const initialDepartments: Department[] = [
    { name: "Reception", code: "FRONT OFFICE", staff: 8, summary: "Guest check-in and checkout, reservations, room assignments, and front desk support.", lead: "Amina Bello", shift: "24-hour coverage", icon: ConciergeBell, accent: "bg-primary/10 text-primary", rooms: 24 },
    { name: "Restaurant", code: "FOOD & BEVERAGE", staff: 9, summary: "Restaurant service, dining room operations, and guest orders.", lead: "Emeka Nwosu", shift: "Breakfast to dinner", icon: Utensils, accent: "bg-brand-warning/10 text-brand-warning" },
    { name: "Kitchen", code: "FOOD PRODUCTION", staff: 7, summary: "Meal preparation, kitchen operations, and food safety.", lead: "Tolu Adeyemi", shift: "Morning & evening", icon: Utensils, accent: "bg-brand-danger/10 text-brand-danger" },
    { name: "Bar", code: "FOOD & BEVERAGE", staff: 4, summary: "Beverage service, bar stock, and guest orders.", lead: "Bola Yusuf", shift: "Afternoon to late", icon: Wine, accent: "bg-accent text-accent-foreground" },
    { name: "Store", code: "INVENTORY", staff: 3, summary: "Hotel supplies, inventory records, and department requests.", lead: "Chinedu Eze", shift: "Day shift", icon: Package, accent: "bg-secondary text-secondary-foreground" },
];


function HotelDepartments() {
    const { api } = UseMetricCards();
    const RoomsPage = (props: { onCreateRoom?: () => void; refreshKey?: number }) => AvailableRoomsPage(props, true);
    const [departments, setDepartments] = useState(initialDepartments);
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [roomsRefreshKey, setRoomsRefreshKey] = useState(0);
    const totalStaff = departments.reduce((total, department) => total + department.staff, 0);
    const handleRoomCreated = useCallback(() => {
        setDepartments((current) => current.map((department) => department.name === "Reception" ? { ...department, rooms: (department.rooms ?? 0) + 1 } : department));
        setRoomsRefreshKey((current) => current + 1);
    }, []);

    const handleDepartmentKeyDown = (event: KeyboardEvent<HTMLDivElement>, department: Department) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedDepartment(department);
        }
    };

    if (selectedDepartment) {
        const Icon = selectedDepartment.icon;
        const isReception = selectedDepartment.name === "Reception";
        return <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" className="gap-2" onClick={() => setSelectedDepartment(null)}><ChevronLeft className="h-4 w-4" />Back to departments</Button>
            </div>
            {isReception ? <RoomsPage onCreateRoom={() => setRoomDialogOpen(true)} refreshKey={roomsRefreshKey}
            /> : <div className="rounded-xl border border-border bg-card p-8">
                <div className={`mb-4 inline-flex rounded-xl p-3 ${selectedDepartment.accent}`}><Icon className="h-6 w-6" /></div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{selectedDepartment.code}</p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">{selectedDepartment.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{selectedDepartment.summary}</p>
            </div>}
            <RoomCreateDialog api={api} open={roomDialogOpen} onOpenChange={setRoomDialogOpen} onCreated={handleRoomCreated} />
        </div>;
    }

    return <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Hotel operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Departments</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">A snapshot of the teams that keep Brandy Hotel running. Department details are sample data for this preview.</p></div><div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"><div className="rounded-md bg-primary/10 p-2 text-primary"><Users className="h-5 w-5" /></div><div><p className="text-xl font-bold leading-none text-foreground">{totalStaff}</p><p className="mt-1 text-xs text-muted-foreground">staff across teams</p></div></div></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => {
                const Icon = department.icon;
                const isReception = department.name === "Reception";
                return (

                    <Card key={department.name} role="button" tabIndex={0} onClick={() => setSelectedDepartment(department)} onKeyDown={(event) => handleDepartmentKeyDown(event, department)} className={`cursor-pointer overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isReception ? "border-primary/40 ring-1 ring-primary/10" : ""}`}><CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className={`rounded-xl p-3 ${department.accent}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
                                {department.code}
                            </span>
                        </div>
                        <div className="mt-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {department.name}
                                </h2>
                                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    {department.summary}
                                </p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" className="mt-0.5 shrink-0 gap-1" onClick={(event) => { event.stopPropagation(); setSelectedDepartment(department); }}>View<ArrowUpRight className="h-4 w-4" /></Button>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                            <div>
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Team size</p>
                                <p className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                                    <Users className="h-4 w-4 text-primary" />
                                    {department.staff} staff
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Department lead
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                                    {department.lead}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Coverage
                                </p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {department.shift}
                                </p>
                            </div>
                            {isReception &&
                                <div>
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                        Rooms managed</p>
                                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                        <BedDouble className="h-4 w-4 text-primary" />{department.rooms} rooms
                                    </p>
                                </div>}
                        </div>
                    </CardContent>
                    </Card>
                )
            })}
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/60 p-4 text-sm text-muted-foreground"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p>Team sizes, department leads, and coverage schedules shown here are sample figures. To add a reception room, first create a category with its nightly price or select an existing category, then enter the room number.</p></div>
    </div>;
}

export default HotelDepartments;
