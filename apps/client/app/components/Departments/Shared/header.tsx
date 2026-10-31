import { Bell, Loader, LucideAlignHorizontalDistributeStart } from "lucide-react";
import { NavLink } from "react-router";
import Logo from "~/components/shared/Logo";
import { Button } from "~/components/ui/button";
import { UseMetricCards } from "~/Context/Context";
import { ThemeToggle } from "~/components/shared/ThemeToggle";

export const DashboardHeader = (
    {
        departments = "",
        staffName = "",
        tabEnd = "",
        tabs = []
    },

) => {

    const { user } = UseMetricCards()


    return (
        <header className="border-b mb-1">
            <div className="w-full mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Logo />
                <div className="flex items-center gap-4  relative">
                    <div className="text-right hidden sm:block">
                        <div className="flex items-center justify-end gap-4">

                            <span className=" p-0.5 rounded text-[14px] font-bold bg-brand-navy-light/90 text-primary uppercase tracking-wider">
                                {departments}
                            </span>

                            <span className="text-xl font-bold text-brand-navy-light">{user?.firstName ? user?.firstName : <Loader className="animate-spin " />} {user?.lastName ? user?.lastName : ""} </span>
                        </div>
                        <p className="text-[13px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                            <span className="w-3 h-3 rounded-full bg-brand-success animate-pulse" />

                            Active shift • Started 10:02 PM • Present - {new Date().toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button className="h-10 w-10 rounded-full bg-secondary text-foreground hover:bg-muted transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                        </Button>
                        <Button className="w-10 h-10 rounded-full bg-secondary border border-input flex items-center justify-center font-bold text-xs text-foreground">
                            {user?.firstName[0]}{user?.lastName[0]}
                        </Button>
                    </div>

                    <span className="h-0.5 w-full bg-border rounded-2xl absolute -bottom-1 "></span>
                </div>
            </div>


            <div className="max-w-7xl mx-auto flex gap-8 border-border/60">
                {tabs.map(({ title, link }: any) => (
                    <NavLink
                        to={link}
                        end={link === `/${tabEnd}/dashboard`}
                    >
                        {({ isActive }) => (
                            <button
                                key={title}

                                className={`py-3 text-[15px] font-semibold relative transition-colors ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {title}

                                {isActive && (<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />)}

                            </button>
                        )}

                    </NavLink>
                ))}
            </div>
        </header>
    );
};
