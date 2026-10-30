import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";

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

        <div>
            <DashboardHeader departments="reception" staffName="Joel David" tabs={tab} tabEnd="receptionist" />
            <main className="p-6">
                <Outlet />
            </main>
        </div>);
}

export default DepartmentsDashboard;