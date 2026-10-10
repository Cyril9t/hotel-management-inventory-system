import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "../../components/ui/sidebar";

import { Link } from "react-router";
import { Home, Settings } from "lucide-react";
import Logo from "../shared/Logo";


const DashboardLinks = [
    {
        title: "Overview",
        link: "/CEO-home"
    }, {
        title: "Activities",
        link: "/staff-actives"
    }
]

function DashboardSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <Logo variant="default" logoColor="#142234" />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        CEO Dashboard

                    </SidebarGroupLabel>

                    <SidebarMenu>
                        <SidebarMenuItem>

                            {DashboardLinks.map((nav) => {
                                return (
                                    <SidebarMenuButton >
                                        <Link to={nav.link}>

                                            <span>{nav.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )
                            })}
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <span className="text-sm">My Account</span>
            </SidebarFooter>
        </Sidebar>
    );
}

export default DashboardSidebar;