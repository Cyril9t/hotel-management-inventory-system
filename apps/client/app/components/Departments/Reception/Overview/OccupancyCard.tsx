import { Card, CardContent, CardHeader } from "~/components/ui/card";



import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from "recharts";

const data = [{ name: "Occupancy", value: 72, fill: "#d99a28" }];

export const OccupancyCard = () => {
    return (
        <div className="flex flex-col gap-7.5 h-full ">

            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold uppercase tracking-wider">
                    ROOM OCCUPANCY & OVERVIEW
                </span>
                <span className="text-xl text-muted-foreground font-medium">Total 50 Rooms</span>
            </div>

            <div className="flex items-center gap-5 my-2">
                <div className="relative w-25 h-25 flex items-center justify-center">
                    <RadialBarChart
                        width={100}
                        height={100}
                        cx="50%"
                        cy="50%"
                        innerRadius="78%"
                        outerRadius="100%"
                        barSize={8}
                        data={data}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            dataKey="value"
                            cornerRadius={10}
                            background={{ fill: "var(--border)" }}
                            angleAxisId={0}
                        />
                    </RadialBarChart>

                    <div className="absolute text-center">
                        <span className="text-base font-bold text-foreground">72%</span>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                            occ
                        </p>
                    </div>
                </div>



                <div>
                    <h3 className="text-3xl font-bold  text-foreground">
                        36 <span className="text-[20px] font-semibold text-muted-foreground">/ 50 Rooms Occupied</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Daily occupancy rate is performing strongly across standard and deluxe suites.
                    </p>
                </div>
            </div>


            <div className="flex w-full gap-3 pt-4 border-t border-border ">
                <Card className=" w-full">
                    <CardHeader>
                        <h1 className="text-[12px] font-bold uppercase tracking-widest">Available</h1>
                    </CardHeader>
                    <CardContent>

                        <p className="text-lg font-bold font-serif text-brand-success mt-0.5">14</p>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>

                        <h1 className="text-[12px] font-bold uppercase tracking-widest">Occupied</h1>
                    </CardHeader>
                    <CardContent>

                        <p className="text-lg font-bold font-serif text-destructive mt-0.5">36</p>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>

                        <h1 className="text-[12px] font-bold uppercase tracking-widest">Checkout Due</h1>
                    </CardHeader>
                    <CardContent>

                        <p className="text-lg font-bold font-serif text-brand-gold mt-0.5">5</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};