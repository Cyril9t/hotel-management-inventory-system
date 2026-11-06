import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "~/Context/AuthContext";
import { api } from "~/lib/api";
import { getRoomOccupancyMetrics, type ApiRoom, type RoomsApiResponse } from "~/components/Departments/Reception/Rooms/type";

type RoomCounts = ReturnType<typeof getRoomOccupancyMetrics> & {
    checkoutDue: number;
    overdue: number;
    byStatus: Record<string, number>;
};
type RoomsContextValue = {
    rooms: ApiRoom[];
    roomsLoading: boolean;
    roomsError: boolean;
    refreshRooms: () => Promise<ApiRoom[]>;
    counts: RoomCounts;
};

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
    const { token, authLoading } = useAuth();
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [roomsError, setRoomsError] = useState(false);
    const roomsRequestRef = useRef<Promise<ApiRoom[]> | null>(null);

    const refreshRooms = useCallback((): Promise<ApiRoom[]> => {
        if (roomsRequestRef.current) return roomsRequestRef.current;
        setRoomsLoading(true);
        setRoomsError(false);
        const request = api.get<RoomsApiResponse>("/rooms")
            .then((response) => {
                const payload = response.data?.data;
                const nextRooms = Array.isArray(payload) ? payload : payload?.rooms ?? response.data?.rooms;
                if (!Array.isArray(nextRooms)) throw new Error("Rooms API response did not contain a room list");
                setRooms(nextRooms);
                return nextRooms;
            })
            .catch((error: unknown) => {
                setRoomsError(true);
                throw error;
            })
            .finally(() => {
                roomsRequestRef.current = null;
                setRoomsLoading(false);
            });
        roomsRequestRef.current = request;
        return request;
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setRooms([]);
            setRoomsLoading(false);
            setRoomsError(false);
            return;
        }
        void refreshRooms().catch(() => {
            // Room views render the shared request's error state.
        });
    }, [authLoading, token, refreshRooms]);

    const counts = useMemo(() => {
        const status = (room: ApiRoom) => String(room.status ?? "UNKNOWN").trim().toUpperCase().replace(/[ _-]+/g, "_");
        const occupancy = getRoomOccupancyMetrics(rooms.map((room) => room.status));
        const checkoutDue = rooms.filter((room) => status(room) === "CHECKOUT_DUE").length;
        const overdue = rooms.filter((room) => status(room) === "OVERDUE").length;
        const byStatus = rooms.reduce<Record<string, number>>((totals, room) => {
            const roomStatus = status(room);
            totals[roomStatus] = (totals[roomStatus] ?? 0) + 1;
            return totals;
        }, {});
        return { ...occupancy, checkoutDue, overdue, byStatus };
    }, [rooms]);

    return <RoomsContext.Provider value={{ rooms, roomsLoading, roomsError, refreshRooms, counts }}>{children}</RoomsContext.Provider>;
}

export function useRooms() {
    const context = useContext(RoomsContext);
    if (!context) throw new Error("useRooms must be used inside RoomsProvider");
    return context;
}
