import Overview from "~/components/GM.dashboard/Overview/Overview";
import { RoomsProvider } from "~/Context/RoomsContext";

function Dashboard() {
    return <RoomsProvider><Overview /></RoomsProvider>;
}

export default Dashboard;
