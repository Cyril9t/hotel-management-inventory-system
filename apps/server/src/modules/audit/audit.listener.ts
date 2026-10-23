import { eventBus } from "#shared/events/bus";
import { auditService } from "./audit.service";
import { logger } from "#shared/logger";

export function registerAuditListeners() {
  eventBus.on("room.deactivated", ({ roomId, actorUserId, wasActive }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "room_deactivated",
        entityType: "Room",
        entityId: roomId,
        beforeValue: { isActive: wasActive },
        afterValue: { isActive: false },
      }),
    );
  });

  eventBus.on("room.reactivated", ({ roomId, actorUserId, wasActive }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "room_reactivated",
        entityType: "Room",
        entityId: roomId,
        beforeValue: { isActive: wasActive },
        afterValue: { isActive: true },
      }),
    );
  });

  eventBus.on(
    "room.categoryPriceChanged",
    ({ categoryId, actorUserId, before, after }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "room_category_price_changed",
          entityType: "RoomCategory",
          entityId: categoryId,
          beforeValue: { pricePerNight: before },
          afterValue: { pricePerNight: after },
        }),
      );
    },
  );

  eventBus.on("booking.checkedOut", ({ bookingId, actorUserId }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "booking_checked_out",
        entityType: "Booking",
        entityId: bookingId,
      }),
    );
  });

  eventBus.on(
    "stock.correctionApplied",
    ({ productId, department, actorUserId, quantity, reason }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "manual_stock_correction",
          entityType: "Product",
          entityId: productId,
          afterValue: { department, quantity, reason },
        }),
      );
    },
  );

  eventBus.on("room.deactivated", ({ roomId, actorUserId, wasActive }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "room_deactivated",
        entityType: "Room",
        entityId: roomId,
        beforeValue: { isActive: wasActive },
        afterValue: { isActive: false },
      }),
    );
  });

  eventBus.on("room.reactivated", ({ roomId, actorUserId, wasActive }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "room_reactivated",
        entityType: "Room",
        entityId: roomId,
        beforeValue: { isActive: wasActive },
        afterValue: { isActive: true },
      }),
    );
  });

  eventBus.on(
    "room.categoryPriceChanged",
    ({ categoryId, actorUserId, before, after }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "room_category_price_changed",
          entityType: "RoomCategory",
          entityId: categoryId,
          beforeValue: { pricePerNight: before },
          afterValue: { pricePerNight: after },
        }),
      );
    },
  );

  eventBus.on(
    "room.categoryNameChanged",
    ({ categoryId, actorUserId, before, after }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "room_category_name_changed",
          entityType: "RoomCategory",
          entityId: categoryId,
          beforeValue: { name: before },
          afterValue: { name: after },
        }),
      );
    },
  );

  eventBus.on("shift.closed", ({ shiftId, actorUserId, before, after }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "shift_closed",
        entityType: "Shift",
        entityId: shiftId,
        beforeValue: before,
        afterValue: after,
      }),
    );
  });

  eventBus.on(
    "booking.manualCheckout",
    ({ bookingId, actorUserId, beforeStatus, actualCheckoutAt }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "manual_booking_checkout",
          entityType: "Booking",
          entityId: bookingId,
          beforeValue: { status: beforeStatus },
          afterValue: { status: "CHECKED_OUT", actualCheckoutAt },
        }),
      );
    },
  );

  eventBus.on(
    "product.deactivated",
    ({ productId, actorUserId, wasActive }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "product_deactivated",
          entityType: "Product",
          entityId: productId,
          beforeValue: { isActive: wasActive },
          afterValue: { isActive: false },
        }),
      );
    },
  );

  eventBus.on(
    "product.reactivated",
    ({ productId, actorUserId, wasActive }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "product_reactivated",
          entityType: "Product",
          entityId: productId,
          beforeValue: { isActive: wasActive },
          afterValue: { isActive: true },
        }),
      );
    },
  );

  eventBus.on(
    "stock.issueDiscrepancy",
    ({ movementId, actorUserId, expectedQuantity, acknowledgedQuantity }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "stock_issue_discrepancy",
          entityType: "StockMovement",
          entityId: movementId,
          beforeValue: { quantity: expectedQuantity },
          afterValue: { acknowledgedQuantity },
        }),
      );
    },
  );

  // stock.acknowledged intentionally NOT subscribed here — a clean (non-discrepancy)
  // acknowledgment isn't audit-worthy on its own, only the discrepancy case is

  // kitchenOrder.statusChanged intentionally NOT here — status progression is
  // excluded from audit per the earlier "routine, self-documenting" decision
}

function safeLog(fn: () => unknown) {
  try {
    fn();
  } catch (err) {
    logger.error({ err }, "audit listener failed");
  }
}
