import Overview from "~/components/CEO.dashboard/Overview/Overview";
import { RoomsProvider } from "~/Context/RoomsContext";

function Owner() {
    return <RoomsProvider><Overview /></RoomsProvider>;
}

export default Owner;
