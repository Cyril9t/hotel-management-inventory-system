import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "~/lib/api";
import { useAuth } from "~/Context/AuthContext";
import { asShiftRecord, closeShift as closeShiftRequest, getCurrentShift, getShiftDetails as getShiftDetailsRequest, getShifts, getSuggestedOpeningCash, logShiftApiFailure, openShift as openShiftRequest, type ShiftRecord } from "~/services/shifts";

type ShiftContextValue = {
    currentShift: ShiftRecord | null;
    currentShiftLoading: boolean;
    currentShiftError: string | null;
    refreshCurrentShift: () => Promise<ShiftRecord | null>;
    loadSuggestedOpeningCash: () => Promise<number>;
    startShift: (openingCash: number) => Promise<{ shift: ShiftRecord; alreadyOpen: boolean } | null>;
    finishShift: (actualCash: number) => Promise<unknown>;
    shiftList: ShiftRecord[];
    shiftListLoading: boolean;
    shiftListError: string | null;
    shiftListLoaded: boolean;
    loadShiftList: () => Promise<ShiftRecord[]>;
    shiftDetails: Record<string, ShiftRecord>;
    loadShiftDetails: (id: string) => Promise<ShiftRecord>;
};

const ShiftContext = createContext<ShiftContextValue | null>(null);

function normalizeRole(role: unknown) {
    return typeof role === "string" ? role.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ") : "";
}

export function ShiftProvider({ children }: { children: ReactNode }) {
    const { token, user, authLoading } = useAuth();
    const [currentShift, setCurrentShift] = useState<ShiftRecord | null>(null);
    const [currentShiftLoading, setCurrentShiftLoading] = useState(true);
    const [currentShiftError, setCurrentShiftError] = useState<string | null>(null);
    const currentShiftRequestRef = useRef<Promise<ShiftRecord | null> | null>(null);
    const currentShiftGenerationRef = useRef(0);
    const authIdentityRef = useRef<string | null | undefined>(undefined);
    const [shiftList, setShiftList] = useState<ShiftRecord[]>([]);
    const [shiftListLoading, setShiftListLoading] = useState(false);
    const [shiftListError, setShiftListError] = useState<string | null>(null);
    const [shiftListLoaded, setShiftListLoaded] = useState(false);
    const [shiftDetails, setShiftDetails] = useState<Record<string, ShiftRecord>>({});
    const shiftDetailsRef = useRef<Record<string, ShiftRecord>>({});
    shiftDetailsRef.current = shiftDetails;

    const refreshCurrentShift = useCallback((): Promise<ShiftRecord | null> => {
        if (currentShiftRequestRef.current) return currentShiftRequestRef.current;
        const requestGeneration = currentShiftGenerationRef.current;
        setCurrentShiftLoading(true);
        setCurrentShiftError(null);
        const request = getCurrentShift(api)
            .then((shift) => {
                if (requestGeneration !== currentShiftGenerationRef.current) return null;
                setCurrentShift(shift);
                return shift;
            })
            .catch((error: any) => {
                if (requestGeneration !== currentShiftGenerationRef.current) return null;
                if (error?.response?.status === 404) {
                    setCurrentShift(null);
                    setCurrentShiftError(null);
                    return null;
                }
                logShiftApiFailure("GET /shifts/current", error);
                const message = error?.response?.data?.error?.message
                    ?? error?.response?.data?.message
                    ?? error?.message
                    ?? "Could not load the current shift.";
                setCurrentShiftError(message);
                throw error;
            })
            .finally(() => {
                if (requestGeneration === currentShiftGenerationRef.current) {
                    currentShiftRequestRef.current = null;
                    setCurrentShiftLoading(false);
                }
            });
        currentShiftRequestRef.current = request;
        return request;
    }, []);

    const loadSuggestedOpeningCash = useCallback(() => getSuggestedOpeningCash(api), []);

    const startShift = useCallback(async (openingCash: number) => {
        try {
            const result = await openShiftRequest(api, openingCash);
            const returnedShift = asShiftRecord(result);
            if (returnedShift) setCurrentShift(returnedShift);
            const activeShift = returnedShift ?? await refreshCurrentShift();
            return activeShift ? { shift: activeShift, alreadyOpen: false } : null;
        } catch (error: any) {
            if (error?.response?.status === 400) {
                const activeShift = await refreshCurrentShift();
                if (activeShift) return { shift: activeShift, alreadyOpen: true };
            }
            throw error;
        }
    }, [refreshCurrentShift]);

    const finishShift = useCallback(async (actualCash: number) => {
        const shiftId = currentShift?.id;
        if (!shiftId) throw new Error("There is no active shift to close.");
        let result: unknown;
        try {
            result = await closeShiftRequest(api, shiftId, actualCash);
        } catch (error: any) {
            if (error?.response?.status === 404) await refreshCurrentShift();
            throw error;
        }
        setCurrentShift(null);
        setCurrentShiftError(null);
        const closedShift = asShiftRecord(result);
        if (closedShift) {
            setShiftDetails((existing) => ({ ...existing, [shiftId]: closedShift }));
            setShiftList((existing) => [closedShift, ...existing.filter((shift) => shift.id !== shiftId)]);
        } else {
            setShiftDetails((existing) => {
                const next = { ...existing };
                delete next[shiftId];
                return next;
            });
        }
        return result;
    }, [currentShift?.id, refreshCurrentShift]);

    const loadShiftList = useCallback(async () => {
        setShiftListLoading(true);
        setShiftListError(null);
        try {
            const shifts = await getShifts(api);
            setShiftList(shifts);
            setShiftListLoaded(true);
            return shifts;
        } catch (error: any) {
            setShiftListError(error?.response?.data?.error?.message ?? "Could not load shift history.");
            throw error;
        } finally {
            setShiftListLoading(false);
        }
    }, []);

    const loadShiftDetails = useCallback(async (id: string) => {
        const existing = shiftDetailsRef.current[id];
        if (existing) return existing;
        const details = await getShiftDetailsRequest(api, id);
        shiftDetailsRef.current = { ...shiftDetailsRef.current, [id]: details };
        setShiftDetails((current) => ({ ...current, [id]: details }));
        return details;
    }, []);

    useEffect(() => {
        if (authLoading) return;
        const identity = token ? String(user?.id ?? token) : null;
        if (authIdentityRef.current !== identity) {
            authIdentityRef.current = identity;
            currentShiftGenerationRef.current += 1;
            currentShiftRequestRef.current = null;
            setCurrentShift(null);
            setCurrentShiftError(null);
            if (identity !== null) {
                setShiftList([]);
                setShiftListError(null);
                setShiftListLoaded(false);
                setShiftDetails({});
                shiftDetailsRef.current = {};
            }
        }
        const shiftEnabled = token && ["receptionist", "bar staff"].includes(normalizeRole(user?.role));
        if (!shiftEnabled) {
            setCurrentShift(null);
            setCurrentShiftError(null);
            setCurrentShiftLoading(false);
            return;
        }
        void refreshCurrentShift().catch(() => { });
    }, [authLoading, token, user?.id, user?.role, refreshCurrentShift]);

    return <ShiftContext.Provider value={{
        currentShift, currentShiftLoading, currentShiftError, refreshCurrentShift,
        loadSuggestedOpeningCash, startShift, finishShift, shiftList, shiftListLoading,
        shiftListError, shiftListLoaded, loadShiftList, shiftDetails, loadShiftDetails,
    }}>{children}</ShiftContext.Provider>;
}

export function useShift() {
    const context = useContext(ShiftContext);
    if (!context) throw new Error("useShift must be used inside ShiftProvider");
    return context;
}
