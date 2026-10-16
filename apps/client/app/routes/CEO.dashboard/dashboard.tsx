import Overview from "~/components/CEO.dashboard/Overview/Overview";
import { RoomsMetric } from "~/Context/Context";

function Owner() {
    return (
        <RoomsMetric>
            <Overview />
        </RoomsMetric>
    );
}

export default Owner;