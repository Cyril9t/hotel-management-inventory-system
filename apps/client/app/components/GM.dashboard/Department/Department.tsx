import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export type Department = {
    name: string;
    code: string;
    summary: string;
    icon: LucideIcon;
    accent: string;
};

interface DepartmentCardProps {
    department: Department;
    onSelect: (department: Department) => void;
}

export function DepartmentCard({ department, onSelect }: DepartmentCardProps) {
    const Icon = department.icon;

    return (
        <Card className="group h-full border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-ring/50">
            <CardContent className="h-full p-0">
                <button
                    type="button"
                    onClick={() => onSelect(department)}
                    className="flex h-full w-full flex-col p-5 text-left focus-visible:outline-none sm:p-6"
                    aria-label={`Open ${department.name} department`}
                >
                    <div className="flex w-full items-start justify-between gap-4">
                        <div className={`rounded-xl border p-3 ${department.accent}`}>
                            <Icon aria-hidden="true" className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {department.code}
                        </span>
                    </div>

                    <div className="mt-5 flex-1">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {department.name}
                        </h2>
                        <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                            {department.summary}
                        </p>
                    </div>

                    <div className="mt-5 flex w-full items-center justify-between border-t border-border/70 pt-4 text-sm font-medium text-primary">
                        <span>Open department</span>
                        <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </button>
            </CardContent>
        </Card>
    );
}
