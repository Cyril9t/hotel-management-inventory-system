import { MetricCards } from "~/components/CEO.dashboard/Overview/MetricCard";
import { RevenueOverviewChart } from "./Revenue";
import { DepartmentPerformance } from "./Dep.performance";
import { RecentActivitiesAndActions } from "./RecentActivities";

function Overview() {
    return (
        <div>
            <MetricCards user="General Manager" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 mt-9">

                <div className="lg:col-span-7">
                    <RevenueOverviewChart />
                </div>
                <div className="lg:col-span-5">
                    <DepartmentPerformance />
                </div>
            </div>

            <RecentActivitiesAndActions />
        </div>
    );
}

export default Overview;