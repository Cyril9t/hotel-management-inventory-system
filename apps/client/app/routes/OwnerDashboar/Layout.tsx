
import OwnerDashboard from "~/components/CEO.dashboard/Layout";
import { DashboardRouteGuard } from "~/Context/Context";



function Dashboard() {

    return (


        <DashboardRouteGuard role="owner">
            <OwnerDashboard />
        </DashboardRouteGuard>

    );
}

export default Dashboard;