import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";
import { DashboardRouteGuard } from "~/Context/Context";
import { ShiftProvider } from "~/Context/ShiftContext";
const tab = [
    {
        title: 'Overview',
        link: "/store_manager/dashboard",
    }, {
        title: 'Inventory',
        link: '/store_manager/dashboard/inventory',
    }, {
        title: 'Receive',
        link: '/store_manager/dashboard/receive'

    }, {
        title: 'Issue',
        link: '/store_manager/dashboard/issue'
    },
    {
        title: 'History',
        link: '/store_manager/dashboard/history'
    },
    {
        title: 'Shift',
        link: '/store_manager/dashboard/shifts'
    }


] as any;


function DepartmentsDashboard() {

    return (
        <ShiftProvider>
        <DashboardRouteGuard role="store_manager">

            <div>
                <DashboardHeader departments="Stor Manager" tabs={tab} tabEnd="store_manager" />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </DashboardRouteGuard>
        </ShiftProvider>
    )
}

export default DepartmentsDashboard;
