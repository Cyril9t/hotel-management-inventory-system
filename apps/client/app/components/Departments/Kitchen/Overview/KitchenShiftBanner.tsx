import React from "react";
import { cn } from "cn";
import { Button } from "~/components/ui/button";
import { ChefHat, Clock, Power, ShieldCheck, AlertCircle } from "lucide-react";
import type { KitchenShiftState } from "../types";

export interface KitchenShiftBannerProps {
  shiftState: KitchenShiftState;
  onOpenShiftClick?: () => void;
  onCloseShiftClick?: () => void;
}

export const KitchenShiftBanner: React.FC<KitchenShiftBannerProps> = ({
  shiftState,
  onOpenShiftClick,
  onCloseShiftClick,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs transition-colors",
        shiftState.hasActiveShift
          ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
          : "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-10 rounded-lg flex items-center justify-center shrink-0 font-bold",
            shiftState.hasActiveShift
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
          )}
        >
          <ChefHat className="size-5" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                shiftState.hasActiveShift
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  shiftState.hasActiveShift
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                )}
              />
              {shiftState.hasActiveShift ? "Active Kitchen Shift" : "No Active Shift"}
            </span>

            {shiftState.shiftId && (
              <span className="text-xs font-mono text-muted-foreground hidden md:inline">
                ID: {shiftState.shiftId}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {shiftState.staffName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {shiftState.hasActiveShift
                ? `Started at ${new Date(shiftState.openedAt || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Open shift to record preparation operations"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {shiftState.hasActiveShift ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onCloseShiftClick}
            className="text-xs h-8 gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <Power className="size-3.5" />
            End Shift
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={onOpenShiftClick}
            className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold"
          >
            <Power className="size-3.5" />
            Open Kitchen Shift
          </Button>
        )}
      </div>
    </div>
  );
};
