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

  // ---- orders — realtime only, not audited: status progression is
  // routine/self-documenting, per the earlier "no audit" decision ----
  "kitchenOrder.statusChanged": {
    orderId: string;
    destination: string;
    status: string;
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
  // realtime only, not audited: a clean (non-discrepancy) acknowledgment isn't audit-worthy on its own
  "stock.acknowledged": {
    movementId: string;
    productId: string;
    department: Department;
    quantity: number;
  };
};
