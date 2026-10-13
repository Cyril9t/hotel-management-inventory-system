import Dashboard from "../../../routes/CEO.dashboard/Layout";
import { MetricCards } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";

function Overview() {
    return (
        <div>
            <MetricCards />
            <RevenueChart />
        </div>

    );
}

export default Overview;