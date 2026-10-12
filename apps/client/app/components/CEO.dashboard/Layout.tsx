import type { ReactNode } from "react";
import {
    SidebarProvider,
    SidebarTrigger,
} from "../../components/ui/sidebar";

import DashboardSidebar from "./Sidebar";
import { Header } from "./header";

type DashboardProps = {
    children: ReactNode;
};

function Dashboard({ children }: DashboardProps) {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <main className="flex-1 p-6">
                <div className="flex "><div className="grow"><SidebarTrigger /></div>
                    <div className=""><Header /></div>
                </div>
                {children}
            </main>
        </SidebarProvider>
    );
}

export default Dashboard;