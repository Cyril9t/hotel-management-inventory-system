import { useRooms } from "~/Context/RoomsContext";

const bookedStatuses = new Set(["RESERVED", "OCCUPIED", "CHECKED_IN", "CHECKOUT_DUE", "OVERDUE"]);

export function DepartmentPerformance() {
    const { rooms, roomsLoading, roomsError, refreshRooms } = useRooms();
    const bookedRooms = rooms.filter((room) => bookedStatuses.has(String(room.status ?? "").trim().toUpperCase().replace(/[ _-]+/g, "_"))).length;
    const receptionRate = rooms.length > 0 ? Math.round((bookedRooms / rooms.length) * 100) : 0;
    const departments = [
        { name: "Reception", score: receptionRate },
        { name: "Bar", score: 87 },
        { name: "Kitchen", score: 78 },
        { name: "Store & Inventory", score: 65 },
    ];

    return (
        <div className="bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-foreground">Department Performance</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Reception progress reflects booked rooms versus total rooms.</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-brand-warning/10 text-brand-warning text-[11px] font-semibold">Active</span>
            </div>

            <div className="space-y-4 my-auto">
                {departments.map((dept) => {
                    const receptionUnavailable = dept.name === "Reception" && (roomsLoading || roomsError);
                    return <div key={dept.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-foreground">{dept.name}</span>
                            <span className="text-foreground">{dept.name === "Reception" && roomsLoading ? "Loading…" : dept.name === "Reception" && roomsError ? "Unavailable" : `${dept.score}%`}</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${receptionUnavailable ? 0 : dept.score}%` }} />
                        </div>
                    </div>;
                })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border mt-4 text-xs">
                <span className="text-muted-foreground">Reception rooms: <strong className="text-foreground">{roomsLoading ? "Loading…" : roomsError ? "Unavailable" : `${bookedRooms} / ${rooms.length} booked`}</strong></span>
                {roomsError ? <button type="button" onClick={() => { void refreshRooms().catch(() => {}); }} className="font-medium text-destructive underline">Retry room data</button> : <span className="text-brand-success font-medium">{receptionRate}% occupancy</span>}
            </div>
        </div>
    );
}
