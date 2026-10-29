import axios, { type AxiosRequestConfig } from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { INITIAL_ROOMS } from "~/components/Departments/Reception/Rooms/data";

const RoomsStat = createContext<any | null>(null);
type DashboardRole = "owner" | "general-manager";
type StoredUser = { role?: string;[key: string]: unknown };

function normalizeRole(role: unknown) {
    return typeof role === "string"
        ? role.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
        : "";
}

export function getDashboardPathForRole(role: unknown) {
    const normalizedRole = normalizeRole(role);

    if (["owner", "ceo", "chief executive officer"].includes(normalizedRole)) {
        return "/owner/dashboard";
    }

    if (["general manager", "gm"].includes(normalizedRole)) {
        return "/general/dashboard";
    }

    return null;
}

export function RoomsMetric({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<StoredUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const tokenRef = useRef<string | null>(null);
    const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

    const api = useMemo(() => axios.create({
        baseURL: "https://hotel-management-inventory-system.onrender.com/api/v1/",
        withCredentials: true,
    }), []);

    const saveSession = useCallback((accessToken: string, nextUser: StoredUser) => {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
        tokenRef.current = accessToken;
        setToken(accessToken);
        setUser(nextUser);
        setAuthLoading(false);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        tokenRef.current = null;
        setToken(null);
        setUser(null);
        setAuthLoading(false);
    }, []);

    const refreshToken = useCallback((): Promise<string | null> => {
        if (refreshPromiseRef.current) return refreshPromiseRef.current;

        refreshPromiseRef.current = api.post("auth/refresh")
            .then((response) => {
                const payload = response.data?.data ?? response.data;
                const accessToken = payload?.accessToken;
                const refreshedUser = payload?.user;
                if (typeof accessToken !== "string" || !accessToken) {
                    throw new Error("Refresh response did not include an access token");
                }

                let cachedUser: StoredUser | null = null;
                try {
                    const parsed: unknown = JSON.parse(localStorage.getItem("user") ?? "null");
                    if (parsed && typeof parsed === "object" && typeof (parsed as StoredUser).role === "string") {
                        cachedUser = parsed as StoredUser;
                    }
                } catch {
                    cachedUser = null;
                }
                const nextUser = refreshedUser && typeof refreshedUser.role === "string"
                    ? refreshedUser as StoredUser
                    : cachedUser;
                if (!nextUser) throw new Error("No user is available for the refreshed session");

                saveSession(accessToken, nextUser);
                return accessToken;
            })
            .catch(() => {
                clearSession();
                return null;
            })
            .finally(() => {
                refreshPromiseRef.current = null;
            });

        return refreshPromiseRef.current;
    }, [api, clearSession, saveSession]);

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            const storedToken = localStorage.getItem("token");
            let storedUser: StoredUser | null = null;
            try {
                const parsed: unknown = JSON.parse(localStorage.getItem("user") ?? "null");
                if (parsed && typeof parsed === "object" && typeof (parsed as StoredUser).role === "string") {
                    storedUser = parsed as StoredUser;
                }
            } catch {
                // An unreadable cached user is discarded after the refresh attempt.
            }

            if (storedToken && storedUser) {
                tokenRef.current = storedToken;
                setToken(storedToken);
                setUser(storedUser);
            }

            await refreshToken();
            if (cancelled) return;
            // refreshToken clears the invalid session on failure and saves the renewed session on success.
        };

        void restoreSession();
        return () => { cancelled = true; };
    }, [refreshToken]);

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use((config) => {
            const url = config.url ?? "";
            const isAuthRequest = url.includes("auth/login") || url.includes("auth/refresh");
            if (tokenRef.current && !isAuthRequest) {
                config.headers.set("Authorization", `Bearer ${tokenRef.current}`);
            }
            return config;
        });

        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const request = error?.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
                const url = request?.url ?? "";
                const isAuthRequest = url.includes("auth/login") || url.includes("auth/refresh") || url.includes("users/invites/accept");

                if (error?.response?.status === 401 && request && !request._retry && !isAuthRequest) {
                    request._retry = true;
                    const nextToken = await refreshToken();
                    if (nextToken) {
                        request.headers = { ...request.headers, Authorization: `Bearer ${nextToken}` };
                        return api(request);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [api, refreshToken]);

    const counts = useMemo(() => {
        const totalRooms = INITIAL_ROOMS.length;
        const occupiedRooms = INITIAL_ROOMS.filter((room) => ["Occupied", "Checkout Due", "Overdue"].includes(room.status)).length;

        return {
            total: totalRooms,
            available: INITIAL_ROOMS.filter((room) => room.status === "Available").length,
            occupied: occupiedRooms,
            checkoutDue: INITIAL_ROOMS.filter((room) => room.status === "Checkout Due").length,
            overdue: INITIAL_ROOMS.filter((room) => room.status === "Overdue").length,
            percentage: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        };
    }, []);

    return (
        <RoomsStat.Provider value={{
            counts,
            token,
            user,
            authLoading,
            saveSession,
            clearSession,
            setEmail,
            setPassword,
            email,
            password,
            api,
            isLoading,
            setIsLoading,
        }}>
            {children}
        </RoomsStat.Provider>
    );
}

export function DashboardRouteGuard({ role, children }: { role: DashboardRole; children: ReactNode }) {
    const { token, user, authLoading } = UseMetricCards();
    const location = useLocation();

    if (authLoading) {
        return <div role="status" className="p-6">Checking your session…</div>;
    }

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    const normalizedRole = normalizeRole(user.role);
    const isOwner = ["owner", "ceo", "chief executive officer"].includes(normalizedRole);
    const isGeneralManager = ["general manager", "gm"].includes(normalizedRole);
    const authorized = role === "owner" ? isOwner : isGeneralManager;

    if (!authorized) {
        return <Navigate to={getDashboardPathForRole(user.role) ?? "/"} replace />;
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
