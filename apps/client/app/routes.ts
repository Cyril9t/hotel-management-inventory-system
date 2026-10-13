import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("CEO.dashboard", "./routes/CEO.dashboard/Layout.tsx", [
        index("./routes/CEO.dashboard/dashboard.tsx"),

        route("activities", "./routes/CEO.dashboard/activities.tsx"),
        route("staffs", "./routes/CEO.dashboard/Staffs.tsx"),
        route("departments", "./routes/CEO.dashboard/Departments.tsx")
    ]),


] satisfies RouteConfig;
