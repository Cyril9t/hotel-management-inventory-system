import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

    index("routes/home.tsx"),
    route("owner/dashboard", "./routes/OwnerDashboar/Layout.tsx", [
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

    route("bar/dashboard", "./routes/Departments/Bar/Layouts.tsx", [
        index("./routes/Departments/Bar/Overview.tsx"),
        route("orders", "./routes/Departments/Bar/Order.tsx"),
        route("sales", "./routes/Departments/Bar/Sale.tsx"),
        route("stock", "./routes/Departments/Bar/Stock.tsx"),
        route("shifts", "./routes/Departments/Bar/Shift.tsx")
    ]),

    route("OpenShift", "./routes/openShift.tsx"),
    route("accept-invite", "./routes/createAccount.tsx")

] satisfies RouteConfig;
