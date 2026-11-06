import HotelRooms from "~/components/Departments/Reception/Rooms/Rooms";
import { RoomsProvider } from "~/Context/RoomsContext";

function Rooms() {
    return <RoomsProvider><HotelRooms /></RoomsProvider>;
}

export default Rooms;
