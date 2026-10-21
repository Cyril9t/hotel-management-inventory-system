import { UseMetricCards } from "~/Context/Context";

import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from "recharts";

function ReceptionRadialBar() {
    const { counts } = UseMetricCards()
    const data = [{ name: "Occupancy", value: counts.percentage, fill: "#d99a28" }];
    return (
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
                    <span className="text-base font-bold text-foreground">{counts.percentage}%</span>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                        occ
                    </p>
                </div>
            </div>



            <div>
                <h3 className="text-3xl font-bold  text-foreground">
                    {counts.occupied} <span className="text-[20px] font-semibold text-muted-foreground">/ {counts.total} Rooms Occupied</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Daily occupancy rate is performing strongly across standard and deluxe suites.
                </p>
            </div>
        </div>
    );
}

export default ReceptionRadialBar;