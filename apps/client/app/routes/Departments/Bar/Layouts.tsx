import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";
import { DashboardRouteGuard } from "~/Context/Context";
import { ShiftProvider } from "~/Context/ShiftContext";
import { BarOrdersProvider } from "~/components/Departments/Bar/Orders/BarOrdersContext";




export const tabs = [
    {
        title: 'Overview',
        link: '/bar/dashboard'
    },
    {
        title: 'Incoming Orders',
        link: '/bar/dashboard/orders'
    },
    {
        title: 'Sales',
        link: '/bar/dashboard/sales'
    },
    {
        title: 'Stock',
        link: "/bar/dashboard/stock"
    },
    {
        title: 'Shift',
        link: '/bar/dashboard/shifts'
    }
] as any;

function DepartmentsDashboard() {

    return (

        <ShiftProvider><BarOrdersProvider>
        <DashboardRouteGuard role="bar">
            <div>
                <DashboardHeader departments="Bar" staffName="Patrick" tabs={tabs} tabEnd="bar" />

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </DashboardRouteGuard>
        </BarOrdersProvider></ShiftProvider>);
}

export default DepartmentsDashboard;
