import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dashboard", "./Page/CEO.dashboard/dashboard.tsx"),
    route("dashboard/:id", "./Page/CEO.dashboard/activities.tsx")


] satisfies RouteConfig;
