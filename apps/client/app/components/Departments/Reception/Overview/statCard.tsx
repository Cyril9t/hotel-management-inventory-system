import { LogIn, LogOut, UtensilsCrossed } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";



const cards = [
    {
        title: "Today's Check-ins",
        icon: <LogIn className="w-4 h-4 text-brand-success" />,
        count: 31,
        label: "guest"
    },
    {
        title: "Today's Check-outs",
        icon: <LogOut className="w-4 h-4 text-destructive" />,
        count: 0,
        label: "guest"
    },
    {
        title: "Room Service Orders",
        icon: <UtensilsCrossed className="w-4 h-4 text-primary" />,
        count: 14,
        label: "pending"
    }
]
export const StatListCard = () => {
    return (

        <div className="flex flex-col gap-2">
            {cards.map(({ title, count, label, icon }) => {
                return (
                    <Card >
                        <CardHeader className="flex gap-2">
                            <h1 className="text-[15px] font-medium">{title} </h1>

                            {icon}
                        </CardHeader>
                        <CardContent>
                            <div className="flex">
                                <div className="grow ">
                                    <h4 className="text-2xl font-bold text-foreground mt-1">
                                        {count} <span className="text-[16px] font-normal text-muted-foreground">{label}</span>
                                    </h4>
                                </div>
                                <Button

                                    className="px-3 py-1.5 bg-secondary text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                                >
                                    View all
                                </Button>
                            </div>

                        </CardContent>

                    </Card>
                )
            })}
        </div>

    );
};