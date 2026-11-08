import { CalendarDays, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export const QuickActionsPanel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Card className="p-3 ">

            <CardHeader>
                <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <Button className="w-full h-10" onClick={() => navigate("/receptionist/dashboard/rooms?quickAction=booking")}>
                    <span className="flex"><Plus /> Check In Guest</span>
                </Button>

                <Button variant={"outline"} className="w-full h-13" onClick={() => navigate("/receptionist/dashboard/roomsService")}>
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    <span>Room Service</span>
                </Button>

                <Button variant={"outline"} className="w-full h-13" onClick={() => navigate("/receptionist/dashboard/rooms?quickAction=booking")}>
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span>New Booking &amp; Payment</span>
                </Button>

                <Button variant={"outline"} className="w-full h-13" onClick={() => navigate("/receptionist/dashboard/history")}>
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>View Bookings</span>
                </Button>
            </CardContent>
        </Card>
    );
};
