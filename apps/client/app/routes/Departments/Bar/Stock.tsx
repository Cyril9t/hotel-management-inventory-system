import { BarStockOverview } from "~/components/Departments/Bar/Stock/BarStockOverview";

function Stock() {
    return <div className="mx-auto w-full max-w-[1600px] space-y-6"><header><p className="text-sm font-medium text-muted-foreground">Bar Operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Stock Overview</h1><p className="mt-2 text-sm text-muted-foreground">Review stock transferred to the Bar and current usage.</p></header><BarStockOverview/></div>;
}

export default Stock;
