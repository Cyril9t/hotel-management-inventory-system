import type { ReactNode } from "react";
import Logo from "../shared/Logo";

export function RecoveryLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen w-full flex bg-background">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-navy flex-col justify-between p-12">
                <div className="absolute inset-0 z-0">
                    <img src="https://i.pinimg.com/1200x/0f/7c/35/0f7c35c2c0f458f4188742f9de3f6eee.jpg" alt="Luxury Hotel Reception" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-brand-navy/35" />
                </div>
                <div className="relative z-10 flex justify-end">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold-light bg-[var(--brand-navy-light)]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--brand-gold)]/20">Secure Portal v3.4</span>
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
                    <Logo variant="hero" logoColor="#172536" textColor="#f2c66d" />
                </div>
                <div className="relative z-10 flex items-center justify-between text-xs text-background">
                    <p>© {new Date().getFullYear()} Brandy Hotel Group. All rights reserved.</p>
                    <p className="font-light">Efficient hotel management for a better tomorrow.</p>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-background">
                <div className="lg:hidden"><Logo variant="default" logoColor="#d99a28" /></div>
                <div className="my-auto py-8">{children}</div>
                <div className="text-center lg:text-right text-xs text-muted-foreground">Brandy Hotel Management System</div>
            </div>
        </div>
    );
}

export function RecoveryMessage({ children, kind = "error" }: { children: ReactNode; kind?: "error" | "success" }) {
    return <p role={kind === "error" ? "alert" : "status"} className={`text-sm ${kind === "error" ? "text-destructive" : "text-foreground"}`}>{children}</p>;
}

export function getRecoveryError(error: any, fallback: string) {
    const message = error?.response?.data?.error?.message;
    return typeof message === "string" ? message : fallback;
}
