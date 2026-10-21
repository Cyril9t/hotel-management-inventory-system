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

import { NavLink, useNavigate } from "react-router";
import {
    LayoutDashboard,
    Activity,
    Users,
    Building2,
    Settings,
    LogOut,
} from "lucide-react";

import Logo from "../shared/Logo";
import { useState } from "react";

const DashboardLinks = [
    {
        title: "Overview",
        link: "/Owner/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Activities",
        link: "/Owner/dashboard/activities",
        icon: Activity,
    },
    {
        title: "Users",
        link: "/Owner/dashboard/staffs",
        icon: Users,
    },
    {
        title: "Departments",
        link: "/Owner/dashboard/departments",
        icon: Building2,
    },
    {
        title: "Settings",
        link: "/Owner/dashboard/settings",
        icon: Settings,
    },
];

function DashboardSidebar() {
    const navigate = useNavigate()

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


                    <SidebarMenu className="mt-4 gap-1 pl-4">
                        {DashboardLinks.map(({ title, link, icon: Icon }) => (
                            <SidebarMenuItem key={link}>
                                <NavLink
                                    to={link}
                                    end={link === "/Owner/dashboard"}

                                >
                                    {({ isActive }) => (
                                        <SidebarMenuButton
                                            tooltip={title}
                                            isActive={isActive}
                                            className={`h-11 text-[15px] font-medium ${isActive ? "bg-brand-gold" : ""}`}
                                        >
                                            <Icon className="size-5 shrink-0" />
                                            <span>{title}</span>
                                        </SidebarMenuButton>
                                    )}
                                </NavLink>
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
                                navigate("/", { replace: true })
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