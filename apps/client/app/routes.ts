import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("CEO.dashboard", "./routes/CEO.dashboard/Layout.tsx", [
        index("./routes/CEO.dashboard/dashboard.tsx"),
        route("activities", "./routes/CEO.dashboard/activities.tsx"),
        route("staffs", "./routes/CEO.dashboard/Staffs.tsx"),
        route("departments", "./routes/CEO.dashboard/Departments.tsx"),
        route("settings", "./routes/CEO.dashboard/settings.tsx")
    ]),
    route("GM.dashboard", "./routes/GM.dashboard/Layout.tsx", [
        index("./routes/GM.dashboard/Dashboard.tsx"),
        route("activities", "./routes/GM.dashboard/Activities.tsx"),
        route("staffs", "./routes/GM.dashboard/Staffs.tsx"),
        route("department", "./routes/GM.dashboard/departments.tsx"),
        route("settings", "./routes/GM.dashboard/settings.tsx")
    ])

] satisfies RouteConfig;
