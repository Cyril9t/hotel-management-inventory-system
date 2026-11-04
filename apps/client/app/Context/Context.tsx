import axios, { type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { getRoomOccupancyMetrics, type ApiRoom, type RoomsApiResponse } from "~/components/Departments/Reception/Rooms/type";
import GlobalLoadingSkeleton from "~/components/shared/LoadingState/LoadingState";
import { asShiftRecord, closeShift as closeShiftRequest, getCurrentShift, getShiftDetails as getShiftDetailsRequest, getShifts, getSuggestedOpeningCash, logShiftApiFailure, openShift as openShiftRequest, type ShiftRecord } from "~/services/shifts";


const RoomsStat = createContext<any | null>(null);
export type DashboardRole = "owner" | "general-manager" | "receptionist" | "bar";
type StoredUser = { role?: string;[key: string]: unknown };

function normalizeRole(role: unknown) {
    return typeof role === "string"
        ? role.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
        : "";
}

type TrackedRequestConfig = AxiosRequestConfig & { _sonnerToastId?: string | number };

function requestLabel(config: AxiosRequestConfig) {
    return `from server`;
}

function apiErrorMessage(error: any) {
    const data = error?.response?.data?.error;
    if (typeof data?.message === "string") return `${data.message} → ${data.code}`;
    if (typeof data?.code === "string") return data.code;
    console.log(error?.response)
    return error?.response ? "Request failed" : "Network error";
}

export function getDashboardPathForRole(role: unknown) {
    const normalizedRole = normalizeRole(role);
    const roleDashboards: Record<string, DashboardRole> = {
        owner: "owner",
        ceo: "owner",
        "chief executive officer": "owner",
        "general manager": "general-manager",
        gm: "general-manager",
        receptionist: "receptionist",
        "bar staff": "bar",
    };
    const dashboard = roleDashboards[normalizedRole];
    return dashboard ? DASHBOARD_PATHS[dashboard] : null;
}

const DASHBOARD_PATHS: Record<DashboardRole, string> = {
    owner: "/owner/dashboard",
    "general-manager": "/general/dashboard",
    receptionist: "/receptionist/dashboard",
    bar: "/bar/dashboard",
};

function readStoredUser(): StoredUser | null {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem("user") ?? "null");
        return parsed && typeof parsed === "object" && typeof (parsed as StoredUser).role === "string"
            ? parsed as StoredUser
            : null;
    } catch {
        return null;
    }
}

function hasFreshAccessToken(accessToken: string) {
    try {
        const encodedPayload = accessToken.split(".")[1];
        if (!encodedPayload) return false;
        const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
        const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), (char) => char.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes));
        return typeof payload.exp === "number" && payload.exp * 1000 > Date.now() + 30_000;
    } catch {
        return false;
    }
}

export function RoomsMetric({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<"light" | "dark">("light");
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<StoredUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authUnavailable, setAuthUnavailable] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [roomsError, setRoomsError] = useState(false);
    const roomsRequestRef = useRef<Promise<ApiRoom[]> | null>(null);
    const [currentShift, setCurrentShift] = useState<ShiftRecord | null>(null);
    const [currentShiftLoading, setCurrentShiftLoading] = useState(true);
    const [currentShiftError, setCurrentShiftError] = useState<string | null>(null);
    const currentShiftRequestRef = useRef<Promise<ShiftRecord | null> | null>(null);
    const [shiftList, setShiftList] = useState<ShiftRecord[]>([]);
    const [shiftListLoading, setShiftListLoading] = useState(false);
    const [shiftListError, setShiftListError] = useState<string | null>(null);
    const [shiftListLoaded, setShiftListLoaded] = useState(false);
    const [shiftDetails, setShiftDetails] = useState<Record<string, ShiftRecord>>({});

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        const nextTheme = storedTheme === "dark" ? "dark" : "light";
        setThemeState(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
    }, []);

    const setTheme = useCallback((nextTheme: "light" | "dark") => {
        setThemeState(nextTheme);
        localStorage.setItem("theme", nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
    }, []);
    const tokenRef = useRef<string | null>(null);
    const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

    const api = useMemo(() => axios.create({
        baseURL: "https://hms-d740.onrender.com/api/v1/",
        withCredentials: true,
    }), []);
    const refreshApi = useMemo(() => axios.create({
        baseURL: api.defaults.baseURL,
        withCredentials: true,
    }), [api]);

    const saveSession = useCallback((accessToken: string, nextUser: StoredUser) => {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
        tokenRef.current = accessToken;
        setToken(accessToken);
        setUser(nextUser);
        setAuthUnavailable(false);
        setAuthLoading(false);
    }, []);

    const clearLocalSession = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        tokenRef.current = null;
        setToken(null);
        setUser(null);
        setAuthUnavailable(false);
        setAuthLoading(false);
    }, []);

    const clearSession = useCallback(async (): Promise<boolean> => {
        try {
            await api.post("auth/logout");
            clearLocalSession();
            return true;
        } catch (error: any) {
            // Clear the local session even when the server cannot be reached.
            console.error("[HMS auth] POST /auth/logout failed", {
                status: error?.response?.status,
                code: error?.response?.data?.error?.code,
                message: error?.response?.data?.error?.message ?? error?.message ?? "Unknown logout error",
            });
            clearLocalSession();
            return false;
        }
    }, [api, clearLocalSession]);

    const refreshToken = useCallback((fallbackUser: StoredUser | null = readStoredUser()): Promise<string | null> => {
        if (refreshPromiseRef.current) return refreshPromiseRef.current;

        setAuthLoading(true);
        setAuthUnavailable(false);
        refreshPromiseRef.current = refreshApi.post("auth/refresh")
            .then((response) => {
                const payload = response.data?.data ?? response.data;
                const accessToken = payload?.accessToken;
                const refreshedUser = payload?.user;
                if (typeof accessToken !== "string" || !accessToken) {
                    throw new Error("Refresh response did not include an access token");
                }

                const nextUser = refreshedUser && typeof refreshedUser.role === "string"
                    ? refreshedUser as StoredUser
                    : fallbackUser;
                if (!nextUser) throw new Error("No user is available for the refreshed session");

                saveSession(accessToken, nextUser);
                return accessToken;
            })
            .catch((error) => {
                if (error?.response?.status === 401) {
                    clearLocalSession();
                } else {
                    // Keep cached credentials and the current URL while the auth service is unavailable.
                    setAuthUnavailable(true);
                    setAuthLoading(false);
                }
                return null;
            })
            .finally(() => {
                refreshPromiseRef.current = null;
            });

        return refreshPromiseRef.current;
    }, [refreshApi, clearLocalSession, saveSession]);

    const restoreSession = useCallback(async () => {
        setAuthLoading(true);
        setAuthUnavailable(false);

        const storedToken = localStorage.getItem("token");
        const storedUser = readStoredUser();
        tokenRef.current = storedToken;
        setToken(storedToken);
        setUser(storedUser);

        if (!storedToken && !storedUser) {
            setAuthLoading(false);
            return null;
        }

        if (storedToken && storedUser && hasFreshAccessToken(storedToken)) {
            setAuthLoading(false);
            return storedToken;
        }

        return refreshToken(storedUser);
    }, [refreshToken]);

    useEffect(() => {
        void restoreSession();
    }, [restoreSession]);

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use((config) => {
            const trackedConfig = config as typeof config & { _sonnerToastId?: string | number };
            const url = config.url ?? "";
            const isLoginOrRefresh = /(?:^|\/)auth\/(?:login|refresh)(?:$|[/?])/.test(url);
            const isShiftApiRequest = /(?:^|\/)shifts(?:\/|$)/.test(url);
            const isBookingApiRequest = /(?:^|\/)bookings(?:\/|$)/.test(url);
            if (tokenRef.current && !isLoginOrRefresh) {
                config.headers.set("Authorization", `Bearer ${tokenRef.current}`);
            }
            if (!isLoginOrRefresh && !isShiftApiRequest && !isBookingApiRequest && typeof window !== "undefined" && !trackedConfig._sonnerToastId) {
                trackedConfig._sonnerToastId = toast.loading(`Requesting ${requestLabel(config)}…`, {
                    description: "Waiting for the server",
                });
            }


            return config;
        });

        const responseInterceptor = api.interceptors.response.use(
            (response) => {
                const config = response.config as typeof response.config & { _sonnerToastId?: string | number };
                if (config._sonnerToastId !== undefined) {
                    const responseMessage = response.data?.message;
                    toast.success(` ${response.status}`, {
                        id: config._sonnerToastId,
                        description: typeof responseMessage === "string"
                            ? responseMessage
                            : "Request completed successfully",
                    });
                }
                return response;
            },
            async (error) => {
                const request = error?.config as (TrackedRequestConfig & { _retry?: boolean }) | undefined;
                const url = request?.url ?? "";
                const isExpectedNoOpenShift = error?.response?.status === 404 && /(?:^|\/)shifts\/current(?:$|[/?])/.test(url);
                const isAuthRequest = /(?:^|\/)auth\/(?:login|logout|refresh)(?:$|[/?])/.test(url)
                    || /(?:^|\/)users\/invites\/[^/]+\/verify(?:$|[/?])/.test(url)
                    || /(?:^|\/)users\/invites\/accept(?:$|[/?])/.test(url);

                if (isExpectedNoOpenShift) {
                    if (request?._sonnerToastId !== undefined) toast.dismiss(request._sonnerToastId);
                    return Promise.reject(error);
                }

                if (error?.response?.status === 401 && request && !request._retry && !isAuthRequest) {
                    request._retry = true;
                    const nextToken = await refreshToken();
                    if (nextToken) {
                        request.headers = { ...request.headers, Authorization: `Bearer ${nextToken}` };
                        return api(request);
                    }
                    if (request._sonnerToastId !== undefined) toast.dismiss(request._sonnerToastId);
                    return Promise.reject(error);
                }

                if (request?._sonnerToastId !== undefined) {
                    toast.error(apiErrorMessage(error), {
                        id: request._sonnerToastId,
                    });


                }

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [api, refreshToken]);


    const refreshRooms = useCallback((): Promise<ApiRoom[]> => {
        if (roomsRequestRef.current) return roomsRequestRef.current;

        setRoomsLoading(true);
        setRoomsError(false);
        const request = api.get<RoomsApiResponse>("/rooms")
            .then((response) => {
                const payload = response.data?.data;
                const nextRooms = Array.isArray(payload)
                    ? payload
                    : payload?.rooms ?? response.data?.rooms;
                if (!Array.isArray(nextRooms)) {
                    throw new Error("Rooms API response did not contain a room list");
                }
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
    }, [api]);

    const refreshCurrentShift = useCallback((): Promise<ShiftRecord | null> => {
        if (currentShiftRequestRef.current) return currentShiftRequestRef.current;

        setCurrentShiftLoading(true);
        setCurrentShiftError(null);
        const request = getCurrentShift(api)
            .then((shift) => {
                setCurrentShift(shift);
                return shift;
            })
            .catch((error: any) => {
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
                currentShiftRequestRef.current = null;
                setCurrentShiftLoading(false);
            });
        currentShiftRequestRef.current = request;
        return request;
    }, [api]);

    const loadSuggestedOpeningCash = useCallback(() => getSuggestedOpeningCash(api), [api]);

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
    }, [api, refreshCurrentShift]);

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
        setShiftDetails((existing) => {
            const next = { ...existing };
            delete next[shiftId];
            return next;
        });
        await refreshCurrentShift().catch(() => null);
        return result;
    }, [api, currentShift?.id, refreshCurrentShift]);

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
    }, [api]);

    const loadShiftDetails = useCallback(async (id: string) => {
        const existing = shiftDetails[id];
        if (existing) return existing;
        const details = await getShiftDetailsRequest(api, id);
        setShiftDetails((current) => ({ ...current, [id]: details }));
        return details;
    }, [api, shiftDetails]);

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setRooms([]);
            setRoomsLoading(false);
            setRoomsError(false);
            return;
        }
        void refreshRooms().catch(() => {
            // The room views render the shared request's error state.
        });
    }, [authLoading, token, refreshRooms]);

    useEffect(() => {
        if (authLoading) return;
        const shiftEnabled = token && ["/receptionist/dashboard", "/bar/dashboard"].includes(getDashboardPathForRole(user?.role) ?? "");
        if (!shiftEnabled) {
            setCurrentShift(null);
            setCurrentShiftError(null);
            setCurrentShiftLoading(false);
            return;
        }
        void refreshCurrentShift().catch(() => { });
    }, [authLoading, token, user?.role, refreshCurrentShift]);

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

        return {
            ...occupancy,
            checkoutDue,
            overdue,
            byStatus,
        };
    }, [rooms]);

    return (
        <RoomsStat.Provider value={{
            counts,
            rooms,
            roomsLoading,
            roomsError,
            refreshRooms,
            currentShift,
            currentShiftLoading,
            currentShiftError,
            refreshCurrentShift,
            loadSuggestedOpeningCash,
            startShift,
            finishShift,
            shiftList,
            shiftListLoading,
            shiftListError,
            shiftListLoaded,
            loadShiftList,
            shiftDetails,
            loadShiftDetails,
            token,
            user,
            authLoading,
            authUnavailable,
            retrySession: restoreSession,
            saveSession,
            clearSession,
            setEmail,
            setPassword,
            email,
            password,
            api,
            isLoading,
            setIsLoading,
            theme,
            setTheme,
        }}>
            {children}
        </RoomsStat.Provider>
    );
}

export function DashboardRouteGuard({ role, children }: { role: DashboardRole; children: ReactNode }) {
    const { token, user, authLoading, authUnavailable, retrySession, currentShift, currentShiftLoading, currentShiftError, refreshCurrentShift } = UseMetricCards();
    const location = useLocation();

    if (authLoading) {
        return <div role="status" className="p-6">
            <GlobalLoadingSkeleton />
        </div>;
    }

    if (authUnavailable) {
        return <div role="status" className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
            <GlobalLoadingSkeleton />
            <p className="text-sm text-muted-foreground">Your session could not be verified because the authentication service is unavailable. Your saved session is still intact.</p>
            <button type="button" onClick={() => void retrySession()} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Retry session restoration
            </button>
        </div>;
    }

    if (!token || !user) {
        return <Navigate to="/" replace state={{ from: location.pathname }} />;
    }

    const authorized = getDashboardPathForRole(user.role) === DASHBOARD_PATHS[role];

    if (!authorized) {
        return <Navigate to={getDashboardPathForRole(user.role) ?? "/"} replace />;
    }

    if (role === "receptionist") {
        if (currentShiftLoading) return <div role="status" className="p-6"><GlobalLoadingSkeleton /></div>;
        if (currentShiftError) return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
            <p role="alert" className="text-sm text-destructive">{currentShiftError}</p>
            <button type="button" onClick={() => { void refreshCurrentShift().catch(() => { }); }} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry current shift</button>
        </div>;
        if (!currentShift) return <Navigate to="/OpenShift" replace state={{ returnTo: location.pathname }} />;
    }

    return children;
}

export function UseMetricCards() {
    const context = useContext(RoomsStat);

    if (!context) {
        throw new Error("Context must be used inside RoomsMetric");
    }

    return context;
}
