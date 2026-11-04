import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";
import { DashboardRouteGuard } from "~/Context/Context";
const tab = [
    {
        title: 'Overview',
        link: "/receptionist/dashboard",
    }, {
        title: 'Rooms',
        link: '/receptionist/dashboard/rooms',
    }, {
        title: 'Room Service',
        link: '/receptionist/dashboard/roomsService'

    }, {
        title: 'History',
        link: '/receptionist/dashboard/history'
    },
    {
        title: 'Shift',
        link: '/receptionist/dashboard/shifts'
    }


] as any;


function DepartmentsDashboard() {

    return (

        <DashboardRouteGuard role="receptionist">
            <div>
                <DashboardHeader departments="reception" tabs={tab} tabEnd="receptionist" />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </DashboardRouteGuard>);
}

export default DepartmentsDashboard;
