export function DepartmentPerformance() {
    const departments = [
        { name: 'Reception', score: 92 },
        { name: 'F&B Service', score: 87 },
        { name: 'Kitchen', score: 78 },
        { name: 'Store & Inventory', score: 65 },
    ];

    return (
        <div className="bg-card border border-border rounded-[var(--radius)] p-6 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold font-serif text-foreground">Department Performance</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Target SLA and fulfillment efficiency</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-brand-warning/10 text-brand-warning text-[11px] font-semibold">
                    Active
                </span>
            </div>

            <div className="space-y-4 my-auto">
                {departments.map((dept, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-foreground">{dept.name}</span>
                            <span className="text-foreground">{dept.score}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${dept.score}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-xs">
                <span className="text-muted-foreground">Overall Shift Avg: <strong className="text-foreground">80.5%</strong></span>
                <span className="text-brand-success font-medium">• On target</span>
            </div>
        </div>
    );
}