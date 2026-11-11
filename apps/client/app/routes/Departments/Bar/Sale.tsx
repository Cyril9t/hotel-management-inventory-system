import { BarRecentSales } from "~/components/Departments/Bar/Sales/BarRecentSales";
import { MOCK_RECENT_SALES } from "~/components/Departments/Bar/mockData";

function Sale() {
    return <div className="mx-auto w-full max-w-[1600px] space-y-4"><div><h1 className="text-2xl font-bold tracking-tight">Bar sales</h1><p className="mt-1 text-sm text-muted-foreground">Review recent transactions and sale details.</p></div><BarRecentSales sales={MOCK_RECENT_SALES}/></div>;
}

export default Sale;
