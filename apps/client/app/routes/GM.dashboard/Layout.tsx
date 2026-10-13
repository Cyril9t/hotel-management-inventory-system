
import {
    SidebarProvider,
    SidebarTrigger,
} from "../../components/ui/sidebar";

import GMDashboardSidebar from "../../components/GM.dashboard/Sidebar";
import { Header } from "../../components/CEO.dashboard/header";
import { Outlet } from "react-router";

function Dashboard() {
    return (
        <SidebarProvider>
            <GMDashboardSidebar />
            <main className="flex-1 p-6">
                <div className="flex "><div className="grow"><SidebarTrigger /></div>
                    <div className=""><Header /></div>
                </div>
                <Outlet />
            </main>
        </SidebarProvider>
    );
}

export default Dashboard;