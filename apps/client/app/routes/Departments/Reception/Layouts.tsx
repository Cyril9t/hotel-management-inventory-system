import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";

const tab = [
    {
        title: 'Overview',
        link: "/reception/dashboard",
    }, {
        title: 'Rooms',
        link: '/reception/dashboard/rooms',
    }, {
        title: 'Room Service',
        link: '/reception/dashboard/roomsService'

    }, {
        title: 'History',
        link: '/reception/dashboard/history'
    },
    {
        title: 'Shift',
        link: '/reception/dashboard/shifts'
    }


] as any;


function DepartmentsDashboard() {
    return (

        <div>
            <DashboardHeader departments="Reception" staffName="Joel David" tabs={tab} tabEnd="reception" />
            <main className="p-6">
                <Outlet />
            </main>
        </div>);
}

export default DepartmentsDashboard;