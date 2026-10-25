import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";




export const tabs = [
    {
        title: 'Overview',
        link: '/bar/dashboard'
    },
    {
        title: 'Orders',
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

        <div>
            <DashboardHeader departments="Bar" staffName="Patrick" tabs={tabs} tabEnd="bar" />

            <main className="p-6">
                <Outlet />
            </main>
        </div>);
}

export default DepartmentsDashboard;