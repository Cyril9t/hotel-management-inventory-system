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
import { PackageCheck, AlertTriangle, CheckCircle2, Boxes } from "lucide-react";
import type { StockDeliveryItem } from "../types";

export interface AcknowledgeDeliveryModalProps {
  item: StockDeliveryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deliveryId: string, actualQuantity: number, note?: string) => void;
}

export const AcknowledgeDeliveryModal: React.FC<AcknowledgeDeliveryModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!item) return null;

  const [receivedQty, setReceivedQty] = useState<number>(item.issuedQuantity);
  const [receivingNote, setReceivingNote] = useState<string>("");

  const difference = receivedQty - item.issuedQuantity;
  const hasMismatch = difference !== 0;

  const handleConfirm = () => {
    onConfirm(item.id, receivedQty, receivingNote);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <DialogHeader className="space-y-1">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <PackageCheck className="size-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Acknowledge Ingredient Delivery
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Verify actual quantities received from Store to credit Kitchen balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Item details card */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-foreground">{item.productName}</p>
                <p className="text-[11px] text-muted-foreground">
                  Category: {item.category} • Sent by {item.fromDepartment}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                #{item.movementId.slice(0, 10)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Issued by Store:</span>
              <span className="font-bold font-mono text-foreground">
                {item.issuedQuantity} {item.unit}
              </span>
            </div>
          </div>

          {/* Actual received input */}
          <div className="space-y-2">
            <Label htmlFor="actual-qty" className="text-xs font-semibold">
              Actual Count Received ({item.unit})
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="actual-qty"
                type="number"
                min={0}
                max={item.issuedQuantity}
                value={receivedQty}
                onChange={(e) => setReceivedQty(Number(e.target.value))}
                className="font-mono text-base font-bold h-10"
              />
              <span className="text-xs font-medium text-muted-foreground shrink-0 w-16">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Discrepancy Live Warning */}
          {hasMismatch ? (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                <span>Quantity Discrepancy Detected</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                You are acknowledging {receivedQty} of {item.issuedQuantity} {item.unit} (
                {difference} {item.unit} variance). This discrepancy will be logged in the daily departmental audit report.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>Full clean delivery count matches issued manifest.</span>
            </div>
          )}

          {/* Optional reason note */}
          <div className="space-y-1">
            <Label htmlFor="rec-note" className="text-[11px] text-muted-foreground">
              Verification Notes (Required if damaged or missing items)
            </Label>
            <Input
              id="rec-note"
              placeholder={hasMismatch ? "e.g. 2 damaged packages returned to storekeeper" : "Optional comments..."}
              value={receivingNote}
              onChange={(e) => setReceivingNote(e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            Confirm Acknowledgement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
