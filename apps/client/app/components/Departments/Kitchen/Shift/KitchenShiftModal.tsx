import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Power, ChefHat, CheckCircle2 } from "lucide-react";
import type { KitchenShiftState } from "../types";

export interface KitchenShiftModalProps {
  shiftState: KitchenShiftState;
  isOpen: boolean;
  mode: "OPEN" | "CLOSE";
  onClose: () => void;
  onConfirm: (cashAmount: number) => void;
}

export const KitchenShiftModal: React.FC<KitchenShiftModalProps> = ({
  shiftState,
  isOpen,
  mode,
  onClose,
  onConfirm,
}) => {
  const [cashAmount, setCashAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(cashAmount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <ChefHat className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {mode === "OPEN" ? "Open Kitchen Shift" : "Close Active Kitchen Shift"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {mode === "OPEN"
                ? "Start your kitchen shift to log meal preparation and inventory intake."
                : `Closing active shift for ${shiftState.staffName} (${shiftState.shiftId}).`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff Member:</span>
                <span className="font-bold text-foreground">{shiftState.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold text-foreground">Kitchen Operations</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cash-float" className="text-xs font-semibold">
                {mode === "OPEN" ? "Opening Cash Float (₦)" : "Closing Cash Count (₦)"}
              </Label>
              <Input
                id="cash-float"
                type="number"
                min={0}
                step={100}
                value={cashAmount}
                onChange={(e) => setCashAmount(Number(e.target.value))}
                placeholder="0"
                className="font-mono text-base font-bold h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Kitchen stations typically operate with a ₦0 cash float unless petty cash is assigned.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
            >
              {mode === "OPEN" ? (
                <>
                  <Power className="size-3.5" />
                  Confirm Open Shift
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Confirm Close Shift
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
