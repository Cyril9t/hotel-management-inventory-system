import { PackageCheck } from "lucide-react";
import { StockReceivingSection } from "~/components/Departments/Kitchen/StockReceiving/StockReceivingSection";

export default function KitchenReceivingPage() {
    return <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <header className="flex items-start gap-3">
            <span className="mt-1 rounded-xl bg-primary/10 p-3 text-primary"><PackageCheck className="h-6 w-6" /></span>
            <div><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Stock Receiving</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Verify stock issues addressed to Kitchen and record the quantity physically received.</p></div>
        </header>
        <StockReceivingSection />
    </div>;
}
