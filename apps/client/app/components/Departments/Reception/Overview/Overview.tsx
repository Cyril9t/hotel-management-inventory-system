import { ExceptionalStaysBanner } from "./Bnaner";
import { OccupancyCard } from "./OccupancyCard";
import { QuickActionsPanel } from "./QuickAction";
import { StatListCard } from "./statCard";
import { MostBookedRooms } from "./MostBookedRooms";
import { useRooms } from "~/Context/RoomsContext";
import { Button } from "~/components/ui/button";

function Overview() {
    const { roomsError, refreshRooms } = useRooms();

    return <div className="space-y-8">
        {roomsError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <span>Could not load room data from the Rooms API.</span>
            <Button variant="outline" size="sm" onClick={() => { void refreshRooms().catch(() => {}); }}>Retry</Button>
        </div>}

        <section aria-label="Room occupancy and status" className="flex flex-col items-stretch gap-6 lg:flex-row">
            <div className="min-w-0 flex-[1.4] rounded-xl border border-border bg-card p-5 sm:p-6"><OccupancyCard /></div>
            <div className="min-w-0 flex-[0.8]"><StatListCard /></div>
        </section>

        <section aria-label="Booking performance and actions" className="flex flex-col items-stretch gap-6 lg:flex-row">
            <div className="min-w-0 flex-[1.5]"><MostBookedRooms /></div>
            <div className="min-w-0 flex-[0.7]"><QuickActionsPanel /></div>
        </section>

        <ExceptionalStaysBanner />
    </div>;
}

export default Overview;
