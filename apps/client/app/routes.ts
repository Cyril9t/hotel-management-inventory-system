import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

    index("routes/home.tsx"),
    route("Owner/dashboard", "./routes/OwnerDashboar/Layout.tsx", [
        index("./routes/OwnerDashboar/dashboard.tsx"),
        route("activities", "./routes/OwnerDashboar/activities.tsx"),
        route("staffs", "./routes/OwnerDashboar/Staffs.tsx"),
        route("departments", "./routes/OwnerDashboar/Departments.tsx"),
        route("settings", "./routes/OwnerDashboar/settings.tsx")
    ]),

    route("general/dashboard", "./routes/GmDashboard/Layout.tsx", [
        index("./routes/GmDashboard/Dashboard.tsx"),
        route("activities", "./routes/GmDashboard/Activities.tsx"),
        route("staffs", "./routes/GmDashboard/Staffs.tsx"),
        route("department", "./routes/GmDashboard/departments.tsx"),
        route("settings", "./routes/GmDashboard/settings.tsx")
    ]),

    route("reception/dashboard", "./routes/Departments/Reception/Layouts.tsx", [
        index("./routes/Departments/Reception/Overview.tsx"),
        route("rooms", "./routes/Departments/Reception/Rooms.tsx"),
        route("roomsService", "./routes/Departments/Reception/Room.Service.tsx"),
        route("history", "./routes/Departments/Reception/History.tsx"),
        route("shifts", "./routes/Departments/Reception/Shift.tsx"),
    ]),

    route("OpenShift", "./routes/openShift.tsx")

] satisfies RouteConfig;
