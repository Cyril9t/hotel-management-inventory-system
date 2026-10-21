import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";

function DepartmentsDashboard() {
    return (

        <div>
            <DashboardHeader />
            <main className="p-6">
                <Outlet />
            </main>
        </div>);
}

export default DepartmentsDashboard;