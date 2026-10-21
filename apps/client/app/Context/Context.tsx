import { createContext, useContext, useMemo } from "react";
import { INITIAL_ROOMS } from "~/components/Departments/Reception/Rooms/data";


const RoomsStat = createContext<any | null>(null)

export function RoomsMetric({ children }: any) {


    const counts = useMemo(() => {
        const totalRooms = INITIAL_ROOMS.length
        const OccupiedRooms = INITIAL_ROOMS.filter((r) => r.status === "Occupied" || r.status === "Checkout Due" || r.status === "Overdue").length;

        return {
            total: INITIAL_ROOMS.length,
            available: INITIAL_ROOMS.filter(r => r.status === "Available").length,
            occupied: INITIAL_ROOMS.filter(r => r.status === "Occupied" || r.status === "Checkout Due" || r.status === "Overdue").length,
            checkoutDue: INITIAL_ROOMS.filter(r => r.status === "Checkout Due").length,
            overdue: INITIAL_ROOMS.filter(r => r.status === "Overdue").length,
            percentage: totalRooms > 0 ? Math.round((OccupiedRooms / totalRooms) * 100) : 0
        }
    }, [INITIAL_ROOMS])

    return (
        <RoomsStat.Provider value={{ counts }}>
            {children}
        </RoomsStat.Provider>
    )
}


export function UseMetricCards() {
    const context = useContext(RoomsStat)

    if (!context) {
        throw new Error("Context Must Be child of MetricCards")
    }

    return context;
}