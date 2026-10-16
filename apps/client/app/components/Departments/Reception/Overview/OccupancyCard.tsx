import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { UseMetricCards } from "~/Context/Context";
import ReceptionRadialBar from "../../Shared/RedalBar";

export const OccupancyCard = () => {
    const { counts } = UseMetricCards()



    return (
        <div className="flex flex-col gap-7.5 h-full ">

            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold uppercase tracking-wider">
                    ROOM OCCUPANCY & OVERVIEW
                </span>
                <span className="text-xl text-muted-foreground font-medium">Total {counts.total} Rooms</span>
            </div>

            <ReceptionRadialBar />


            <div className="flex w-full gap-3 pt-4 border-t border-border ">
                <Card className=" w-full">
                    <CardHeader>
                        <h1 className="text-[12px] font-bold uppercase tracking-widest">Available Rooms</h1>
                    </CardHeader>
                    <CardContent>

                        <p className="text-3xl font-bold font-serif text-brand-success mt-0.5">{counts.available}</p>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>

                        <h1 className="text-[12px] font-bold uppercase tracking-widest">Occupied Rooms</h1>
                    </CardHeader>
                    <CardContent>

                        <p className="text-3xl font-bold font-serif text-destructive mt-0.5">{counts.occupied}</p>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>

                        <h1 className="text-[12px] font-bold uppercase tracking-widest">Checkout Due</h1>
                    </CardHeader>
                    <CardContent>

                        <p className="text-3xl font-bold font-serif text-brand-gold mt-0.5">{counts.checkoutDue}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};