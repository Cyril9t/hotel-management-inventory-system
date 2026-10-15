import { ArrowRight, Home } from "lucide-react";

export const ExceptionalStaysBanner: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-brand-gold/10 via-card to-card border border-brand-gold/30 rounded-[var(--radius)] p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-gold/20 flex items-center justify-center text-primary">
                    <Home className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-bold font-serif text-foreground">Exceptional Stays</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Create memorable experiences for your guests.</p>
                </div>
            </div>
            <a href="#learn" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Learn more <ArrowRight className="w-3.5 h-3.5" />
            </a>
        </div>
    );
};