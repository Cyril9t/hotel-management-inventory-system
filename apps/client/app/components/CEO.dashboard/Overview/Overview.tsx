import Dashboard from "../Layout";
import { MetricCards } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";

function Overview() {
    return (
        <Dashboard >

            <MetricCards />
            <RevenueChart />
        </Dashboard>
    );
}

export default Overview;