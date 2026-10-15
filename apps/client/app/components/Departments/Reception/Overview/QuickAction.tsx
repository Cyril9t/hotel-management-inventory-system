import { CalendarDays, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export const QuickActionsPanel: React.FC = () => {
    return (
        <Card className="p-3 ">

            <CardHeader>
                <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <Button className="w-full h-10 ">
                    <span className="flex"><Plus /> Check In Guest</span>
                </Button>

                <Button variant={"outline"} className="w-full h-13">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    <span>Room Service</span>
                </Button>

                <Button variant={"outline"} className="w-full h-13">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span>Make a Sale</span>
                </Button>

                <Button variant={"outline"} className="w-full h-13">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>View Bookings</span>
                </Button>
            </CardContent>
        </Card>
    );
};