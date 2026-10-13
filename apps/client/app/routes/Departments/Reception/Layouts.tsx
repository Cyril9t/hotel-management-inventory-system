import { Outlet } from "react-router";
import { DashboardHeader } from "../../../components/Departments/Shared/header";

function DepartmentsDashboard() {
    return (

        <div>
            <DashboardHeader />
            <main>
                <Outlet />
            </main>
        </div>);
}

export default DepartmentsDashboard;