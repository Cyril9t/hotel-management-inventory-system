import { Bell } from "lucide-react";
import { NavLink } from "react-router";
import Logo from "~/components/shared/Logo";
import { Button } from "~/components/ui/button";

export const DashboardHeader = () => {
    const tabs = [
        {
            title: 'Overview',
            link: "/reception/dashboard",
        }, {
            title: 'Rooms',
            link: '/reception/dashboard/rooms',
        }, {
            title: 'Room Service',
            link: '/reception/dashboard/roomsService'

        }, {
            title: 'History',
            link: '/reception/dashboard/history'
        },
        {
            title: 'Shift',
            link: '/reception/dashboard/shifts'
        }


    ] as const;

    return (
        <header className="border-b mb-1">
            <div className="w-full mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Logo />
                <div className="flex items-center gap-4">

                    <div className="text-right hidden sm:block">
                        <div className="flex items-center justify-end gap-4">

                            <span className="px-2 py-0.5 rounded text-[14px] font-bold bg-brand-gold/15 text-primary uppercase tracking-wider">
                                RECEPTION
                            </span>

                            <span className="text-xl font-bold text-brand-navy-light">David Bello</span>
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
                        <Button className="h-10 w-10 rounded-full bg-secondary text-foreground hover:bg-muted transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                        </Button>
                        <Button className="w-10 h-10 rounded-full bg-secondary border border-input flex items-center justify-center font-bold text-xs text-foreground">
                            DB
                        </Button>
                    </div>
                </div>
            </div>


            <div className="max-w-7xl mx-auto flex gap-8 border-border/60">
                {tabs.map(({ title, link }) => (
                    <NavLink
                        to={link}
                        end={link === "/reception/dashboard"}
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