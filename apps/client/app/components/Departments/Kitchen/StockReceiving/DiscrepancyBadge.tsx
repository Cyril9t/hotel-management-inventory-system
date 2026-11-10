import React from "react";
import { cn } from "cn";
import { AlertTriangle, CheckCircle } from "lucide-react";

export interface DiscrepancyBadgeProps {
  issuedQuantity: number;
  acknowledgedQuantity: number | null;
  unit: string;
}

export const DiscrepancyBadge: React.FC<DiscrepancyBadgeProps> = ({
  issuedQuantity,
  acknowledgedQuantity,
  unit,
}) => {
  if (acknowledgedQuantity === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground border border-border">
        Pending Count
      </span>
    );
  }

  const difference = acknowledgedQuantity - issuedQuantity;

  if (difference === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
        <CheckCircle className="size-3" />
        Full Match ({acknowledgedQuantity} {unit})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
      <AlertTriangle className="size-3" />
      Discrepancy: {difference > 0 ? `+${difference}` : difference} {unit}
    </span>
  );
};
