import { Outlet } from "react-router";
import { DashboardHeader } from "~/components/Departments/Shared/header";
import { DashboardRouteGuard } from "~/Context/Context";
import { ShiftProvider } from "~/Context/ShiftContext";

export const tabs = [
  {
    title: "Overview",
    link: "/kitchen/dashboard",
  },
  {
    title: "Orders Board",
    link: "/kitchen/dashboard/orders",
  },
  {
    title: "Stock Receiving",
    link: "/kitchen/dashboard/receiving",
  },
  {
    title: "Shift",
    link: "/kitchen/dashboard/shifts",
  },
];

export default function KitchenDashboardLayout() {
  return (
    <ShiftProvider>
      <DashboardRouteGuard role="kitchen">
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <DashboardHeader
            departments="Kitchen"
            staffName="Chef Marco"
            tabs={tabs as any}
            tabEnd="kitchen"
          />

          <main className="p-4 sm:p-6 flex-1">
            <Outlet />
          </main>
        </div>
      </DashboardRouteGuard>
    </ShiftProvider>
  );
}
