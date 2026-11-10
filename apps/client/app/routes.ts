import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

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

    layout("./routes/Shift/Layout.tsx", [
        route("receptionist/dashboard", "./routes/Departments/Reception/Layouts.tsx", [
            index("./routes/Departments/Reception/Overview.tsx"),
            route("rooms", "./routes/Departments/Reception/Rooms.tsx"),
            route("roomsService", "./routes/Departments/Reception/Room.Service.tsx"),
            route("history", "./routes/Departments/Reception/History.tsx"),
            route("shifts", "./routes/Departments/Reception/Shift.tsx"),
        ]),
        route("OpenShift", "./routes/openShift.tsx"),
    ]),

    route("bar/dashboard", "./routes/Departments/Bar/Layouts.tsx", [
        index("./routes/Departments/Bar/Overview.tsx"),
        route("orders", "./routes/Departments/Bar/Order.tsx"),
        route("sales", "./routes/Departments/Bar/Sale.tsx"),
        route("stock", "./routes/Departments/Bar/Stock.tsx"),
        route("shifts", "./routes/Departments/Bar/Shift.tsx")
    ]),

    route("kitchen/dashboard", "./routes/Departments/Kitchen/Layouts.tsx", [
        index("./routes/Departments/Kitchen/Overview.tsx"),
        route("orders", "./routes/Departments/Kitchen/Orders.tsx"),
        route("receiving", "./routes/Departments/Kitchen/Receiving.tsx"),
        route("shifts", "./routes/Departments/Kitchen/Shift.tsx"),
    ]),

    route("store_manager/dashboard", "./routes/Departments/Store/Layouts.tsx", [
        index("./routes/Departments/Store/overview.tsx"),
        route("inventory", "./routes/Departments/Store/Inventory.tsx"),
        route("products", "./routes/Departments/Store/Products.tsx"),
        route("receive", "./routes/Departments/Store/receive.tsx"),
        route("issue", "./routes/Departments/Store/Issue.tsx"),
        route("corrections", "./routes/Departments/Store/Corrections.tsx"),
        route("history", "./routes/Departments/Store/History.tsx"),
        route("shift", "./routes/Departments/Store/Shift.tsx"),
    ]),

    route("accept-invite", "./routes/createAccount.tsx"),
    route("forgot-password", "./routes/forgotPassword.tsx"),
    route("reset-password", "./routes/resetPassword.tsx")

] satisfies RouteConfig;
