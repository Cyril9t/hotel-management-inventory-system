import { Bell, Search, User } from "lucide-react";
import { Button } from "../ui/button";
import { UseMetricCards } from "~/Context/Context";

export function Header() {
    const { user } = UseMetricCards()



    return (
        <header className="flex items-center justify-between mb-7 ">

            <div className="flex items-center gap-4">

                <Button variant={"outline"} className="h-10 w-10 relative rounded-full ">
                    <Bell className="w-4 h-4 " />
                    <span className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-destructive" />
                </Button>

                <Button variant={"default"} className="h-10 w-10  rounded-full ">
                    {user.firstName[0].toUpperCase()}
                </Button>
            </div>
        </header>
    );
}