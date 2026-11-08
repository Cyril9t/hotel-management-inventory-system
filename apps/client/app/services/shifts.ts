import type { AxiosInstance } from "axios";

export interface ApiSuccess<T = unknown> {
    success: true;
    data: T;
}

export interface ShiftRecord extends Record<string, unknown> {
    id: string;
    userId?: string;
    department?: string;
    openedAt?: string;
    closedAt?: string | null;
    openingCash?: string;
    expectedCash?: string | number | null;
    actualCash?: string | null;
    variance?: string | null;
    status?: "OPEN" | "CLOSED";
    isStale?: boolean;
    user?: { firstName?: string; lastName?: string };
    receptionSnapshot?: ReceptionSnapshot | null;
}

export interface ReceptionSnapshot {
    id: string;
    shiftId: string;
    roomSnapshotOpen: Array<{ id: string; number: string; status: string }>;
    roomSnapshotClose: Array<{ id: string; number: string; status: string }> | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findShiftRecords(value: unknown): ShiftRecord[] {
    if (Array.isArray(value)) return value.flatMap(findShiftRecords);
    if (!isRecord(value)) return [];
    if (typeof value.id === "string" && value.id.length > 0) return [value as ShiftRecord];
    return Object.values(value).flatMap(findShiftRecords);
}

export function asShiftRecord(value: unknown): ShiftRecord | null {
    const candidates = findShiftRecords(value);
    return candidates.length === 1 ? candidates[0] : null;
}

export function logShiftApiFailure(endpoint: string, error: any) {
    const body = error?.response?.data;
    console.error(`[HMS shifts] ${endpoint} failed`, {
        status: error?.response?.status,
        code: body?.error?.code,
        message: body?.error?.message ?? body?.message ?? error?.message ?? "Unknown request error",
        details: body?.error?.details,
    });
}

function logInvalidShiftResponse(endpoint: string, data: unknown) {
    const keys = isRecord(data) ? Object.keys(data) : [];
    console.error(`[HMS shifts] ${endpoint} returned an unexpected response shape`, {
        dataType: Array.isArray(data) ? "array" : data === null ? "null" : typeof data,
        dataKeys: keys,
        candidateShiftCount: findShiftRecords(data).length,
    });
}

export async function getCurrentShift(api: AxiosInstance): Promise<ShiftRecord> {
    const response = await api.get<ApiSuccess<unknown>>("/shifts/current");
    const shift = asShiftRecord((response.data?.data as { shift?: unknown } | undefined)?.shift);
    if (!shift) {
        logInvalidShiftResponse("GET /shifts/current", response.data?.data);
        throw new Error("The current shift response did not contain one identifiable shift record. Check the browser console for response keys.");
    }
    return shift;
}

export async function getSuggestedOpeningCash(api: AxiosInstance): Promise<number> {
    const response = await api.get<ApiSuccess<unknown>>("/shifts/suggested-opening-cash");
    const amount = Number((response.data?.data as { suggestedOpeningCash?: unknown } | undefined)?.suggestedOpeningCash);
    if (!Number.isFinite(amount) || amount < 0) {
        logInvalidShiftResponse("GET /shifts/suggested-opening-cash", response.data?.data);
        throw new Error("Suggested opening cash response did not contain one valid nonnegative amount");
    }
    return amount;
}

export async function openShift(api: AxiosInstance, openingCash: number): Promise<unknown> {
    const response = await api.post<ApiSuccess<unknown>>("/shifts/open", { openingCash });
    return (response.data?.data as { shift?: unknown } | undefined)?.shift;
}

export async function closeShift(api: AxiosInstance, id: string, actualCash: number): Promise<unknown> {
    const response = await api.patch<ApiSuccess<unknown>>(`/shifts/${encodeURIComponent(id)}/close`, { actualCash });
    return response.data?.data;
}

export async function getShiftDetails(api: AxiosInstance, id: string): Promise<ShiftRecord> {
    const response = await api.get<ApiSuccess<unknown>>(`/shifts/${encodeURIComponent(id)}`);
    const shift = asShiftRecord((response.data?.data as { shift?: unknown } | undefined)?.shift);
    if (!shift) {
        logInvalidShiftResponse("GET /shifts/{id}", response.data?.data);
        throw new Error("The shift details response did not contain one identifiable shift record. Check the browser console for response keys.");
    }
    return shift;
}

export async function getShifts(api: AxiosInstance): Promise<ShiftRecord[]> {
    const response = await api.get<ApiSuccess<unknown>>("/shifts");
    const shifts = (response.data?.data as { shifts?: unknown } | undefined)?.shifts;
    if (!Array.isArray(shifts) || !shifts.every((value) => isRecord(value) && typeof value.id === "string")) {
        logInvalidShiftResponse("GET /shifts", response.data?.data);
        throw new Error("Shifts API response did not contain one identifiable shift list");
    }
    return shifts as ShiftRecord[];
}
