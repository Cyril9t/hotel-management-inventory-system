import React, { type KeyboardEvent } from "react";
import { BedDouble, Users, ArrowUpRight, Building2, ConciergeBell, Utensils, Package, Wine } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export type Department = {
    name: string;
    code: string;
    staff: number;
    summary: string;
    lead: string;
    shift: string;
    icon: typeof Building2;
    accent: string;
    rooms?: number;
};

interface DepartmentCardProps {
    department: Department;
    onSelect: (department: Department) => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>, department: Department) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
    department,
    onSelect,
    onKeyDown,
}) => {
    const Icon = department.icon;
    const isReception = department.name === "Reception";

    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={() => onSelect(department)}
            onKeyDown={(event) => onKeyDown(event, department)}
            className={`group relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer bg-card border-border ${isReception ? "border-primary/40 ring-1 ring-primary/20 bg-gradient-to-b from-primary/5 to-transparent" : ""
                }`}
        >
            <CardContent className="p-6">
                {/* Top Header Row */}
                <div className="flex items-start justify-between gap-4">
                    <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-105 ${department.accent}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-border/80 bg-secondary/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {department.code}
                    </span>
                </div>

                {/* Name & Summary */}
                <div className="mt-5 flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <h2 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                            {department.name}
                        </h2>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {department.summary}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-0.5 shrink-0 gap-1 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={(event) => {
                            event.stopPropagation();
                            onSelect(department);
                        }}
                    >
                        <span>View</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                </div>

                {/* Metadata Details Grid */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            Team Size
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            {department.staff} Staff
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            Department Lead
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-foreground">
                            {department.lead}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            Coverage
                        </p>
                        <p className="mt-1 text-xs font-medium text-foreground">
                            {department.shift}
                        </p>
                    </div>

                    {isReception && (
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                Rooms Managed
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground">
                                <BedDouble className="h-3.5 w-3.5 text-primary" />
                                {department.rooms} Rooms
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};