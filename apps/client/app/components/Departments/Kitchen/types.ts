export type KitchenOrderStatus = "INCOMING" | "PREPARING" | "READY" | "DELIVERED" | "VOIDED";

export type PaymentMethod = "CASH" | "TRANSFER" | "CARD" | "CHARGE_TO_ROOM";
export type PaymentState = "UNPAID" | "PAID";

export interface KitchenOrderItem {
  id: string;
  kitchenOrderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAtOrder: number;
  lineTotal: number;
  specialNotes?: string;
}

export interface KitchenOrder {
  id: string;
  orderRef: string;
  saleId: string;
  destination: string;
  status: KitchenOrderStatus;
  createdByUserId: string;
  createdByStaffName: string;
  createdByUserRole: string;
  createdAt: string;
  sourceDepartment: "RESTAURANT" | "BAR";
  items: KitchenOrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentState: PaymentState;
  chargeToRoomBookingId?: string | null;
  roomNumber?: string;
  tableNumber?: string;
  preparationStartedAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
}

export interface StockDeliveryItem {
  id: string;
  movementId: string;
  productId: string;
  productName: string;
  category: string;
  fromDepartment: string;
  toDepartment: "KITCHEN";
  issuedQuantity: number;
  acknowledgedQuantity: number | null;
  unit: string;
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedByStaffName: string | null;
  status: "PENDING_VERIFICATION" | "ACKNOWLEDGED" | "DISCREPANCY";
  notes?: string;
}

export interface KitchenMetrics {
  incomingCount: number;
  preparingCount: number;
  readyCount: number;
  completedTodayCount: number;
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
