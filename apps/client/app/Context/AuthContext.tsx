import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api, configureApiClient, refreshApi } from "~/lib/api";

export type AuthUser = { role?: string; [key: string]: any };
type AuthContextValue = {
    token: string | null;
    user: AuthUser | null;
    authLoading: boolean;
    authUnavailable: boolean;
    retrySession: () => Promise<string | null>;
    saveSession: (accessToken: string, nextUser: AuthUser) => void;
    clearSession: () => Promise<boolean>;
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
type RefreshOperation = { generation: number; promise: Promise<string | null> };

function readStoredUser(): AuthUser | null {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem("user") ?? "null");
        return parsed && typeof parsed === "object" && typeof (parsed as AuthUser).role === "string"
            ? parsed as AuthUser
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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authUnavailable, setAuthUnavailable] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const tokenRef = useRef<string | null>(null);
    const sessionGenerationRef = useRef(0);
    const refreshPromiseRef = useRef<RefreshOperation | null>(null);

    const saveSession = useCallback((accessToken: string, nextUser: AuthUser) => {
        sessionGenerationRef.current += 1;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
        tokenRef.current = accessToken;
        setToken(accessToken);
        setUser(nextUser);
        setAuthUnavailable(false);
        setAuthLoading(false);
    }, []);

    const applyClearedSession = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        tokenRef.current = null;
        setToken(null);
        setUser(null);
        setAuthUnavailable(false);
        setAuthLoading(false);
    }, []);

    const clearLocalSession = useCallback(() => {
        sessionGenerationRef.current += 1;
        applyClearedSession();
    }, [applyClearedSession]);

    const clearSession = useCallback(async (): Promise<boolean> => {
        const logoutGeneration = ++sessionGenerationRef.current;
        try {
            await api.post("/auth/logout");
            if (sessionGenerationRef.current === logoutGeneration) applyClearedSession();
            return true;
        } catch (error: any) {
            const status = error?.response?.status;
            console.error("[HMS auth] POST /auth/logout failed", {
                status,
                code: error?.response?.data?.error?.code,
                message: error?.response?.data?.error?.message ?? error?.message ?? "Unknown logout error",
            });
            if (sessionGenerationRef.current === logoutGeneration) applyClearedSession();
            // If the server returned 401, the session is already invalidated on the  Server
            return status === 401;
        }
    }, [applyClearedSession]);

    const refreshToken = useCallback((fallbackUser: AuthUser | null = readStoredUser()): Promise<string | null> => {
        const generation = sessionGenerationRef.current;
        const existingRefresh = refreshPromiseRef.current;
        if (existingRefresh?.generation === generation) return existingRefresh.promise;
        setAuthLoading(true);
        setAuthUnavailable(false);
        let operation: RefreshOperation;
        const promise = refreshApi.post("auth/refresh")
            .then((response) => {
                if (sessionGenerationRef.current !== generation) return null;
                const payload = response.data?.data ?? response.data;
                const accessToken = payload?.accessToken;
                const refreshedUser = payload?.user;
                if (typeof accessToken !== "string" || !accessToken) throw new Error("Refresh response did not include an access token");
                const nextUser = refreshedUser && typeof refreshedUser.role === "string"
                    ? refreshedUser as AuthUser
                    : fallbackUser;
                if (!nextUser) throw new Error("No user is available for the refreshed session");
                localStorage.setItem("token", accessToken);
                localStorage.setItem("user", JSON.stringify(nextUser));
                tokenRef.current = accessToken;
                setToken(accessToken);
                setUser(nextUser);
                setAuthUnavailable(false);
                setAuthLoading(false);
                return accessToken;
            })
            .catch((error) => {
                if (sessionGenerationRef.current !== generation) return null;
                if (error?.response?.status === 401) clearLocalSession();
                else {
                    setAuthUnavailable(true);
                    setAuthLoading(false);
                }
                return null;
            })
            .finally(() => {
                if (refreshPromiseRef.current === operation) refreshPromiseRef.current = null;
            });
        operation = { generation, promise };
        refreshPromiseRef.current = operation;
        return promise;
    }, [clearLocalSession]);

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

    useEffect(() => { void restoreSession(); }, [restoreSession]);
    useEffect(() => configureApiClient(() => tokenRef.current, refreshToken), [refreshToken]);

    return <AuthContext.Provider value={{
        token, user, authLoading, authUnavailable, retrySession: restoreSession,
        saveSession, clearSession, email, setEmail, password, setPassword, isLoading, setIsLoading,
    }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
