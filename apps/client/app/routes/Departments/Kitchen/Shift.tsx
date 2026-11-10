import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { KitchenShiftBanner } from "~/components/Departments/Kitchen/Overview/KitchenShiftBanner";
import { KitchenShiftModal } from "~/components/Departments/Kitchen/Shift/KitchenShiftModal";
import { initialShiftState } from "~/components/Departments/Kitchen/mockData";
import { ChefHat, Clock, Power, ShieldCheck, History, Calendar } from "lucide-react";
import type { KitchenShiftState } from "~/components/Departments/Kitchen/types";

export default function KitchenShiftPage() {
  const [shiftState, setShiftState] = useState<KitchenShiftState>(initialShiftState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"OPEN" | "CLOSE">("OPEN");

  const handleOpenShift = (cashAmount: number) => {
    setShiftState({
      hasActiveShift: true,
      shiftId: `shf-kitchen-${Math.floor(1000 + Math.random() * 9000)}`,
      openedAt: new Date().toISOString(),
      staffName: "Chef Marco",
      department: "KITCHEN",
      openingCash: cashAmount,
    });
  };

  const handleCloseShift = () => {
    setShiftState((prev) => ({
      ...prev,
      hasActiveShift: false,
      shiftId: null,
      openedAt: null,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Kitchen Staff Shift Operations
        </h1>
        <p className="text-xs text-muted-foreground">
          Active duty monitoring and workstation shift reconciliation.
        </p>
      </div>

      <KitchenShiftBanner
        shiftState={shiftState}
        onOpenShiftClick={() => {
          setModalMode("OPEN");
          setIsModalOpen(true);
        }}
        onCloseShiftClick={() => {
          setModalMode("CLOSE");
          setIsModalOpen(true);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Shift Card */}
        <Card className="border border-border bg-card">
          <CardHeader className="p-4 sm:p-5 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Current Workstation Shift Details
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Parameters recorded upon shift initialization.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Staff Member:</span>
              <span className="font-bold text-foreground">{shiftState.staffName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-semibold text-foreground">Kitchen</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {shiftState.hasActiveShift ? "Active / In Progress" : "Shift Closed"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Opening Cash Float:</span>
              <span className="font-mono font-bold text-foreground">
                ₦ {shiftState.openingCash.toLocaleString()}
              </span>
            </div>
            {shiftState.openedAt && (
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Session Start:</span>
                <span className="font-mono text-foreground">
                  {new Date(shiftState.openedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shift Guidelines */}
        <Card className="border border-border bg-card">
          <CardHeader className="p-4 sm:p-5 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="size-4 text-primary" />
              Kitchen Shift Protocol
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Standard operating procedures for meal prep sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-2.5 text-xs text-muted-foreground">
            <p>
              • <strong>Shift Opening:</strong> Kitchen staff must have an active shift session before acknowledging stock deliveries or transitioning order statuses.
            </p>
            <p>
              • <strong>Financial Scope:</strong> Kitchen operations do not directly collect guest payments. Cash floats remain ₦0 unless authorized petty cash is logged.
            </p>
            <p>
              • <strong>Shift Handover:</strong> Always verify that all preparing tickets are either delivered or transferred before ending your shift.
            </p>
          </CardContent>
        </Card>
      </div>

      <KitchenShiftModal
        shiftState={shiftState}
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalMode === "OPEN" ? handleOpenShift : handleCloseShift}
      />
    </div>
  );
}
