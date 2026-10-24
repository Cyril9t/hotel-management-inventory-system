import type { Department, Prisma } from "@prisma/client";

export type DomainEvents = {
  // ---- rooms ----
  "room.deactivated": {
    roomId: string;
    actorUserId: string;
    wasActive: boolean;
  };
  "room.reactivated": {
    roomId: string;
    actorUserId: string;
    wasActive: boolean;
  };
  "room.categoryPriceChanged": {
    categoryId: string;
    actorUserId: string;
    before: Prisma.Decimal;
    after: number;
  };
  "room.categoryNameChanged": {
    categoryId: string;
    actorUserId: string;
    before: string;
    after: string;
  };

  // ---- bookings ----
  "booking.manualCheckout": {
    bookingId: string;
    actorUserId: string;
    beforeStatus: string;
    actualCheckoutAt: Date | null;
  };
  "booking.created": {
    bookingId: string;
    actorUserId: string;
    roomId: string;
    totalPrice: Prisma.Decimal;
    paymentMethod: string;
  };

  // ---- shifts ----
  "shift.closed": {
    shiftId: string;
    actorUserId: string;
    before: { status: string; openingCash: Prisma.Decimal };
    after: {
      status: "CLOSED";
      actualCash: number;
      expectedCash: number;
      variance: number;
    };
  };
  "shift.opened": {
    shiftId: string;
    actorUserId: string;
    department: Department;
    openingCash: Prisma.Decimal;
  };

  // ---- orders — realtime only, not audited: status progression is
  // routine/self-documenting, per the earlier "no audit" decision ----
  "kitchenOrder.statusChanged": {
    orderId: string;
    destination: string;
    status: string;
  };

  // ---- orders ----
  "sale.voidRequested": {
    saleId: string;
    actorUserId: string;
    sourceDepartment: Department;
    totalAmount: Prisma.Decimal;
    voidReason: string;
  };
  "sale.voidApproved": {
    saleId: string;
    actorUserId: string;
    requestedByUserId: string;
    sourceDepartment: Department;
    totalAmount: Prisma.Decimal;
  };
  "sale.settled": {
    saleId: string;
    actorUserId: string;
    chargeToRoomBookingId: string;
    totalAmount: Prisma.Decimal;
  };
  "sale.created": {
    saleId: string;
    actorUserId: string;
    sourceDepartment: Department;
    totalAmount: Prisma.Decimal;
    paymentMethod: string;
    kitchenOrderId: string | null;
  };

  // ---- stock ----
  "product.deactivated": {
    productId: string;
    actorUserId: string;
    wasActive: boolean;
    department: Department;
  };
  "product.reactivated": {
    productId: string;
    actorUserId: string;
    wasActive: boolean;
    department: Department;
  };
  "stock.issueDiscrepancy": {
    movementId: string;
    actorUserId: string;
    expectedQuantity: number;
    acknowledgedQuantity: number;
  };
  "stock.correctionApplied": {
    productId: string;
    department: Department;
    actorUserId: string;
    adjustment: number; // signed — positive = credit, negative = debit
    correctionReason: string;
  };
  "stock.received": {
    movementId: string;
    productId: string;
    actorUserId: string;
    quantity: number;
  };
  "stock.issued": {
    movementId: string;
    productId: string;
    actorUserId: string;
    fromDepartment: Department;
    toDepartment: Department;
    quantity: number;
  };

  // realtime only, not audited: a clean (non-discrepancy) acknowledgment isn't audit-worthy on its own
  "stock.acknowledged": {
    movementId: string;
    productId: string;
    department: Department;
    quantity: number;
  };
};
