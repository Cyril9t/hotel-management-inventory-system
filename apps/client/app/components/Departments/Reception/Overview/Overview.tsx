import { ExceptionalStaysBanner } from "./Bnaner";
import { OccupancyCard } from "./OccupancyCard";
import { QuickActionsPanel } from "./QuickAction";
import { RecentActivityFeed } from "./recentActivities";
import { StatListCard } from "./statCard";

function Overview() {
    return (

        <div >
            <div className="">


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