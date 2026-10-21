import { Play, ShieldCheck } from "lucide-react";

function OpenHeader() {
    return (
        <div className="p-6 rounded-2xl bg-card">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-accent text-accent-foreground">
                        <Play size={25} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Open Operational Shift
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Verify your opening drawer balance and launch your shift session.
                        </p>
                    </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-primary">
                    <ShieldCheck className="w-3.5 h-3.5" /> Shift Handover Protocol
                </span>
            </div>
        </div>
    );
}

export default OpenHeader;