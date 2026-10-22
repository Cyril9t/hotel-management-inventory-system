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
