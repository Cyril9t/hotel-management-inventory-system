import Overview from "~/components/GM.dashboard/Overview/Overview";
import { RoomsMetric } from "~/Context/Context";

function Dashboard() {
    return (
        <RoomsMetric>

            <Overview />
        </RoomsMetric>
    );
}

export default Dashboard;