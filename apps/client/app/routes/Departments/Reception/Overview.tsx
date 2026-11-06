
import Overview from "~/components/Departments/Reception/Overview/Overview";
import { RoomsProvider } from "~/Context/RoomsContext";

function ReceptionOverview() {
    return <RoomsProvider><Overview /></RoomsProvider>;
}

export default ReceptionOverview;
