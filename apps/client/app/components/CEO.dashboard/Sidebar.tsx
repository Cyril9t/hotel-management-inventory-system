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

import { NavLink } from "react-router";
import {
    LayoutDashboard,
    Activity,
    Users,
    Building2,
    Settings,
    LogOut,
} from "lucide-react";

import Logo from "../shared/Logo";

const DashboardLinks = [
    {
        title: "Overview",
        link: "/CEO-home",
        icon: LayoutDashboard,
    },
    {
        title: "Activities",
        link: "/dashboard/:id",
        icon: Activity,
    },
    {
        title: "Users",
        link: "/all-staffs",
        icon: Users,
    },
    {
        title: "Departments",
        link: "/all-departments",
        icon: Building2,
    },
    {
        title: "Settings",
        link: "/settings",
        icon: Settings,
    },
];

function DashboardSidebar() {
    return (
        <Sidebar className="bg-brand-navy text-background">
            <SidebarHeader className="px-4 py-5">
                <Logo
                    variant="default"
                    logoColor="#142234"
                    textColor="#d99a28"
                />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div className="mb-4 mt-3 flex h-auto flex-col items-start gap-1 opacity-90">
                            <span className="text-xl font-semibold tracking-tight text-background">
                                David Jones
                            </span>

                            <span className="text-sm font-medium text-background/70">
                                CEO Dashboard
                            </span>
                        </div>
                    </SidebarGroupLabel>

                    <SidebarMenu className="gap-1 mt-4 pl-4">
                        {DashboardLinks.map(({ title, link, icon: Icon }) => (
                            <SidebarMenuItem key={link}>
                                <SidebarMenuButton

                                    tooltip={title}
                                    className="h-11 text-[15px] font-medium text-background/80 hover:bg-brand-navy-light hover:text-background data-[active=true]:bg-brand-navy-light data-[active=true]:text-background"
                                >
                                    <NavLink
                                        to={`${link}/${title}`}
                                        end={link === "/CEO-home"}
                                        className={({ isActive }) =>
                                            isActive ? "bg-brand-gold text-background" : ""
                                        }
                                    >
                                        <div className="flex gap-1.5 ">
                                            <div className="place-content-center">

                                                <Icon className="size-5 shrink-0" />
                                            </div>
                                            <div>{title}</div>
                                        </div>
                                    </NavLink>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => {
                                // Add your logout logic here
                            }}
                            className="h-11 text-background/80 hover:bg-brand-navy-light hover:text-background"
                        >
                            <LogOut className="size-5" />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export default DashboardSidebar;