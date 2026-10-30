import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import type { Room } from "./type";

export const RoomOccupancyHeader: React.FC<{ rooms: Room[] }> = ({ rooms }) => {
    const available = rooms.filter((room) => room.status === "Available").length;
    const checkoutDue = rooms.filter((room) => room.status === "Checkout Due").length;
    const overdue = rooms.filter((room) => room.status === "Overdue").length;
    const occupied = rooms.length - available;
    const percentage = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;

    const data = [{ name: "Occupancy", value: percentage, fill: "#d99a28" }];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

            <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">

                <div className="flex items-center gap-5 my-2">
                    <div className="relative w-20 h-20 flex items-center justify-center">
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
                            <span className="text-base font-bold text-foreground">{percentage}%</span>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                                occ
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <span className="text font-semibold text-muted-foreground uppercase tracking-wider block">
                        Occupancy Rate
                    </span>
                    <span className="text-sm font-medium text-foreground">
                        <strong className="text-foreground">{occupied}</strong> / {rooms.length} rooms
                    </span>
                </div>
            </div>


            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                    <span className="text font-semibold text-muted-foreground uppercase tracking-wider block">
                        Available
                    </span>
                    <p className="text-xl font-bold font-serif text-foreground mt-0.5">{available}</p>
                    <p className="text-[13px] text-muted-foreground">Rooms ready</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border-2 border-emerald-500" />
            </div>


            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                    <span className="text font-semibold text-muted-foreground uppercase tracking-wider block">
                        Occupied
                    </span>
                    <p className="text-xl font-bold font-serif text-foreground mt-0.5">{occupied}</p>
                    <p className="text-[13px] text-muted-foreground">In-house guests</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-500" />
            </div>


            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                    <span className="text font-semibold text-muted-foreground uppercase tracking-wider block">
                        Checkout Due
                    </span>
                    <p className="text-xl font-bold font-serif text-foreground mt-0.5">{checkoutDue}</p>
                    <p className="text-[13px] text-muted-foreground">Due by 12:00 PM</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border-2 border-amber-500" />
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
                <div>
                    <span className="text font-semibold text-muted-foreground uppercase tracking-wider block">
                        Overdue
                    </span>
                    <p className="text-xl font-bold font-serif text-rose-500 mt-0.5">{overdue}</p>
                    <p className="text-[13px] text-muted-foreground">Late checkout</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-rose-500/20 border-2 border-rose-500" />
            </div>
        </div>
    );
};

