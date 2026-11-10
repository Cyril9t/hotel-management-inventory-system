import { MetricCards } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";
import { ReceptionRevenueProvider } from "~/Context/ReceptionRevenueContext";

function Overview() {
    return <ReceptionRevenueProvider><div>
        <MetricCards user="Owner" />
        <RevenueChart />
    </div></ReceptionRevenueProvider>;
}

export default Overview;
