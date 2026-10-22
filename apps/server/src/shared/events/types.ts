import type { Decimal } from "node_modules/@prisma/client/runtime/client";

export type DomainEvents = {
  // "room.deactivated": {
  //   roomId: string;
  //   actorUserId: string;
  //   wasActive: boolean;
  // };
  // "room.reactivated": {
  //   roomId: string;
  //   actorUserId: string;
  //   wasActive: boolean;
  // };
  "room.categoryPriceChanged": {
    categoryId: string;
    actorUserId: string;
    before: number | Decimal;
    after: number;
  };
  "booking.checkedOut": { bookingId: string; actorUserId: string };
  "kitchenOrder.statusChanged": {
    orderId: string;
    destination: string;
    status: string;
  };
  "stock.correctionApplied": {
    productId: string;
    department: string;
    actorUserId: string;
    quantity: number;
    reason: string;
  };

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
  // "room.categoryPriceChanged": {
  //   categoryId: string;
  //   actorUserId: string;
  //   before: unknown;
  //   after: number;
  // };
  "room.categoryNameChanged": {
    categoryId: string;
    actorUserId: string;
    before: string;
    after: string;
  };
  "shift.closed": {
    shiftId: string;
    actorUserId: string;
    before: { status: string; openingCash: unknown };
    after: {
      status: "CLOSED";
      actualCash: number;
      expectedCash: unknown;
      variance: unknown;
    };
  };
  "booking.manualCheckout": {
    bookingId: string;
    actorUserId: string;
    beforeStatus: string;
    actualCheckoutAt: Date;
  };
  // add one entry per event as you wire up the rest
};
