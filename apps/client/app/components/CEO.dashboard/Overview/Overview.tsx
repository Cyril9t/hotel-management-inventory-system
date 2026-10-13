import Dashboard from "../../../routes/CEO.dashboard/Layout";
import { MetricCards } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";

function Overview() {
    return (
        <div>
            <MetricCards user="Owner" />
            <RevenueChart />
        </div>

    );
}

export default Overview;