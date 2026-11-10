import { Outlet } from "react-router";
import { DashboardHeader } from "~/components/Departments/Shared/header";
import { DashboardRouteGuard } from "~/Context/Context";
import { ShiftProvider } from "~/Context/ShiftContext";
import { KitchenOperationsProvider } from "~/Context/KitchenOperationsContext";
import { useAuth } from "~/Context/AuthContext";

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
  const { user } = useAuth();
  const staffName = [user?.firstName, user?.lastName].filter((part) => typeof part === "string").join(" ");
  return (
    <ShiftProvider>
      <DashboardRouteGuard role="kitchen">
        <KitchenOperationsProvider>
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <DashboardHeader
              departments="Kitchen"
              staffName={staffName}
              tabs={tabs as any}
              tabEnd="kitchen"
              tabsScrollable
            />

            <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </KitchenOperationsProvider>
      </DashboardRouteGuard>
    </ShiftProvider>
  );
}
