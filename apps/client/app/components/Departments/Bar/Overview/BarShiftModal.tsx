import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ShieldCheck, Banknote, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatNaira } from '../mockData';
import type { BarShiftInfo } from '../types';

interface BarShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: BarShiftInfo;
  mode: 'OPEN' | 'CLOSE';
  onConfirm: (actualCash?: number, notes?: string) => void;
}

export const BarShiftModal: React.FC<BarShiftModalProps> = ({
  open,
  onOpenChange,
  shift,
  mode,
  onConfirm,
}) => {
  const [actualCash, setActualCash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const numCash = actualCash.trim() !== '' ? Number(actualCash) : null;
  const variance =
    numCash !== null && !Number.isNaN(numCash)
      ? numCash - shift.expectedCash
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(numCash ?? undefined, notes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {mode === 'CLOSE' ? 'Close Bar Shift' : 'Open New Bar Shift'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {mode === 'CLOSE'
                    ? 'Reconcile cash drawer and finalize your active service shift.'
                    : 'Initialize opening float and begin bar transactions.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="my-5 space-y-4">
            {mode === 'CLOSE' ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/80 bg-secondary/30 p-3">
                    <span className="text-muted-foreground font-medium">Opening Float</span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {formatNaira(shift.openingCash)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-secondary/30 p-3">
                    <span className="text-muted-foreground font-medium">Cash Collected</span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {formatNaira(shift.cashPaymentsReceived)}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <span className="text-primary font-semibold">Expected Cash in Drawer</span>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {formatNaira(shift.expectedCash)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="actual-cash" className="text-xs font-semibold">
                    Actual Physical Cash Counted (₦) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="actual-cash"
                      type="number"
                      placeholder="e.g. 167500"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      required
                      min={0}
                      step="any"
                      className="pr-12 text-sm font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">
                      NGN
                    </span>
                  </div>
                </div>

                {/* Real-time variance indicator */}
                {variance !== null && (
                  <div
                    className={`rounded-lg p-3 text-xs font-medium border flex items-center justify-between ${
                      variance === 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : variance > 0
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {variance === 0 ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <span>
                        {variance === 0
                          ? 'Drawer is perfectly balanced!'
                          : variance > 0
                          ? `Cash overage: ${formatNaira(variance)}`
                          : `Cash shortage: ${formatNaira(Math.abs(variance))}`}
                      </span>
                    </div>
                    <span className="font-mono font-bold">
                      {variance > 0 ? `+${formatNaira(variance)}` : formatNaira(variance)}
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="shift-notes" className="text-xs font-semibold text-muted-foreground">
                    Closing Handover Notes (Optional)
                  </Label>
                  <Input
                    id="shift-notes"
                    placeholder="e.g. Transferred ₦167,500 to main hotel safe"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="opening-float" className="text-xs font-semibold">
                    Opening Cash Float (₦) *
                  </Label>
                  <Input
                    id="opening-float"
                    type="number"
                    placeholder="e.g. 25000"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    required
                    min={0}
                    className="text-sm font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Verify the physical cash given by the Store Manager or Reception before initiating your shift.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={mode === 'CLOSE' ? 'default' : 'default'}
              className="font-semibold"
            >
              {mode === 'CLOSE' ? 'Confirm & Close Shift' : 'Start Bar Shift'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
