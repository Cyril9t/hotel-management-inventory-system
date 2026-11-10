import React from "react";
import { cn } from "cn";
import { AlertTriangle, CheckCircle } from "lucide-react";

export interface DiscrepancyBadgeProps {
  issuedQuantity: number;
  acknowledgedQuantity: number | null;
  unit?: string;
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
      <span className="inline-flex items-center gap-1 rounded border border-brand-success/30 bg-brand-success/10 px-2 py-0.5 text-xs font-semibold text-brand-success">
        <CheckCircle className="size-3" />
        Received {acknowledgedQuantity}{unit ? ` ${unit}` : ""} · full match
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded border border-brand-warning/30 bg-brand-warning/10 px-2 py-0.5 text-xs font-bold text-brand-warning">
      <AlertTriangle className="size-3" />
      Discrepancy: {difference > 0 ? `+${difference}` : difference}{unit ? ` ${unit}` : ""}
    </span>
  );
};
