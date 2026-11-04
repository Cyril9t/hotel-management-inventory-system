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
import { UseMetricCards } from "~/Context/Context";
import { useState } from "react";

const DashboardLinks = [
    {
        title: "Overview",
        link: "/owner/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Activities",
        link: "/owner/dashboard/activities",
        icon: Activity,
    },
    {
        title: "Users",
        link: "/owner/dashboard/staffs",
        icon: Users,
    },
    {
        title: "Departments",
        link: "/owner/dashboard/departments",
        icon: Building2,
    },
    {
        title: "Settings",
        link: "/owner/dashboard/settings",
        icon: Settings,
    },
];

function DashboardSidebar() {

    const navigate = useNavigate()
    const { clearSession, user } = UseMetricCards()

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
                                {user.firstName} {user.lastName}
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
                                    end={link === "/owner/dashboard"}

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
                                clearSession();
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