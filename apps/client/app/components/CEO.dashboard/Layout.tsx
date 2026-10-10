import type { ReactNode } from "react";
import {
    SidebarProvider,
    SidebarTrigger,
} from "../../components/ui/sidebar";

import DashboardSidebar from "./Sidebar";

type DashboardProps = {
    children: ReactNode;
};

function Dashboard({ children }: DashboardProps) {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <main className="flex-1 p-6">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    );
}

export default Dashboard;