import { ExceptionalStaysBanner } from "./Bnaner";
import { OccupancyCard } from "./OccupancyCard";
import { QuickActionsPanel } from "./QuickAction";
import { RecentActivityFeed } from "./recentActivities";
import { StatListCard } from "./statCard";
import { UseMetricCards } from "~/Context/Context";
import { Button } from "~/components/ui/button";

function Overview() {
    const { roomsError, refreshRooms } = UseMetricCards();

    return (

        <div >
            <div className="">

                {roomsError && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <span>Could not load room data from the Rooms API.</span>
                    <Button variant="outline" size="sm" onClick={() => { void refreshRooms().catch(() => {}); }}>Retry</Button>
                </div>}


                <div className="flex flex-row gap-10 h-fit p-3">
                    <div className="w-full grow">

                        <OccupancyCard />
                    </div>
                    <div className="w-full ">

                        <StatListCard />

                    </div>
                </div>


                <div className="flex gap-10 w-full mt-10">
                    <div className="w-full">
                        <RecentActivityFeed />
                    </div>

                    <div className="w-full">
                        <QuickActionsPanel />

                    </div>

                </div>

                <div className="mt-10">
                    <ExceptionalStaysBanner />

                </div>

            </div>

        </div>

    );
}

export default Overview;
