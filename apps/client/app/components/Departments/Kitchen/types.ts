export interface KitchenMetrics {
  incomingCount: number;
  preparingCount: number;
  readyCount: number;
  completedTodayCount: number | null;
  totalTodayCount: number;
}

export interface KitchenShiftState {
  hasActiveShift: boolean;
  shiftId: string | null;
  openedAt: string | null;
  staffName: string;
  department: string;
  openingCash: number;
}
