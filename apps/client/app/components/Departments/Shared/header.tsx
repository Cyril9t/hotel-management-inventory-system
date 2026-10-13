import { Bell } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import Logo from "~/components/shared/Logo";

export const DashboardHeader = () => {
    const tabs = [
        {
            title: 'Overview',
            link: "/reception",
        }, {
            title: 'Rooms',
            link: '/reception/rooms',
        }, {
            title: 'Room Service',
            link: '/reception/roomsService'

        }, {
            title: 'History',
            link: '/reception/history'
        },
        {
            title: 'Shift',
            link: '/reception/shifts'
        }


    ] as const;

    return (
        <header className="bg-card border-b border-border shadow-sm">

            <div className="w-full mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <Logo />

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="flex items-center justify-end gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gold/15 text-brand-gold uppercase tracking-wider">
                                RECEPTION
                            </span>
                            <span className="text-xs font-bold text-foreground">David Bello</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                            Active shift • Started 10:02 PM • Present
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full bg-secondary text-foreground hover:bg-muted transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                        </button>
                        <div className="w-9 h-9 rounded-full bg-secondary border border-input flex items-center justify-center font-bold text-xs text-foreground">
                            DB
                        </div>
                    </div>
                </div>
            </div>


            <div className="max-w-7xl mx-auto px-6 flex gap-8 border-t border-border/60">
                {tabs.map(({ title, link }) => (
                    <NavLink
                        to={link}
                        end={link === "/reception"}
                    >
                        {({ isActive }) => (
                            <button
                                key={title}

                                className={`py-3 text-xs font-semibold relative transition-colors ${isActive
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