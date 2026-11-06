import { createContext, useContext, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import GlobalLoadingSkeleton from "~/components/shared/LoadingState/LoadingState";
import { api } from "~/lib/api";
import { useAuth } from "~/Context/AuthContext";
import { useShift } from "~/Context/ShiftContext";


const RoomsStat = createContext<any | null>(null);
export type DashboardRole = "owner" | "general-manager" | "receptionist" | "bar" | "store_manager";
function normalizeRole(role: unknown) {
    return typeof role === "string"
        ? role.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
        : "";
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
        "store manager": "store_manager",
    };
    const dashboard = roleDashboards[normalizedRole];
    return dashboard ? DASHBOARD_PATHS[dashboard] : null;
}

const DASHBOARD_PATHS: Record<DashboardRole, string> = {
    owner: "/owner/dashboard",
    "general-manager": "/general/dashboard",
    receptionist: "/receptionist/dashboard",
    bar: "/bar/dashboard",
    store_manager: "/store_manager/dashboard"
};

export function RoomsMetric({ children }: { children: ReactNode }) {
    return <RoomsStat.Provider value={{ api }}>{children}</RoomsStat.Provider>;
}

export function DashboardRouteGuard({ role, children }: { role: DashboardRole; children: ReactNode }) {
    const { token, user, authLoading, authUnavailable, retrySession } = useAuth();
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

    if (role === "receptionist") return <ReceptionShiftGuard>{children}</ReceptionShiftGuard>;
    return children;
}

function ReceptionShiftGuard({ children }: { children: ReactNode }) {
    const { currentShift, currentShiftLoading, currentShiftError, refreshCurrentShift } = useShift();
    const location = useLocation();
    if (currentShiftLoading) return <div role="status" className="p-6"><GlobalLoadingSkeleton /></div>;
    if (currentShiftError) return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-destructive">{currentShiftError}</p>
        <button type="button" onClick={() => { void refreshCurrentShift().catch(() => { }); }} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry current shift</button>
    </div>;
    if (!currentShift) return <Navigate to="/OpenShift" replace state={{ returnTo: location.pathname }} />;
    return children;
}

export function UseMetricCards() {
    const context = useContext(RoomsStat);

    if (!context) {
        throw new Error("Context must be used inside RoomsMetric");
    }

    return context;
}
