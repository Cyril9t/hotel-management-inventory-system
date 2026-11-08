import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";
import { DashboardRouteGuard } from "~/Context/Context";
import { ShiftProvider } from "~/Context/ShiftContext";
import { StoreStockDataProvider } from "~/components/Departments/Store/StockManagementWorkspace";

const tabs = [
    { title: "Overview", link: "/store_manager/dashboard" },
    { title: "Inventory", link: "/store_manager/dashboard/inventory" },
    { title: "Products", link: "/store_manager/dashboard/products" },
    { title: "Receive Stock", link: "/store_manager/dashboard/receive" },
    { title: "Issue Stock", link: "/store_manager/dashboard/issue" },
    { title: "Corrections", link: "/store_manager/dashboard/corrections" },
    { title: "History", link: "/store_manager/dashboard/history" },
    { title: "Shift", link: "/store_manager/dashboard/shift" },
];

export default function DepartmentsDashboard() {
    return <ShiftProvider><DashboardRouteGuard role="store_manager">
        <div>
            <DashboardHeader departments="Store Manager" tabs={tabs as any} tabEnd="store_manager" tabsScrollable />
            <StoreStockDataProvider><main className="p-4 sm:p-6"><Outlet /></main></StoreStockDataProvider>
        </div>
    </DashboardRouteGuard></ShiftProvider>;
}
