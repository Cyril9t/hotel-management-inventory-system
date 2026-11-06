import { Outlet } from "react-router";
import { ShiftProvider } from "~/Context/ShiftContext";

export default function ShiftRoutesLayout() {
    return <ShiftProvider><Outlet /></ShiftProvider>;
}
