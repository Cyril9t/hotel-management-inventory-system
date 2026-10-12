import { Bell, Search, User } from "lucide-react";
import { Button } from "../ui/button";

export function Header() {
    return (
        <header className="flex items-center justify-between ">

            <div className="flex items-center gap-4">

                <Button variant={"outline"} className="h-10 w-10  rounded-full ">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                </Button>

                <Button variant={"default"} className="h-10 w-10  rounded-full ">
                    <User className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}