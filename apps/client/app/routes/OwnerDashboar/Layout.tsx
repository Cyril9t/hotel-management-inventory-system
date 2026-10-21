import type { ReactNode } from "react";
import {
    SidebarProvider,
    SidebarTrigger,
} from "../../components/ui/sidebar";

import DashboardSidebar from "../../components/CEO.dashboard/Sidebar";
import { Header } from "../../components/CEO.dashboard/header";
import { Outlet } from "react-router";

type DashboardProps = {
    children: ReactNode;
};

function Dashboard() {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <main className="flex-1 p-4">
                <div className="flex "><div className="grow"><SidebarTrigger /></div>
                    <div className=""><Header /></div>
                </div>
                <Outlet />
            </main>
        </SidebarProvider>
    );
}

export default Dashboard;