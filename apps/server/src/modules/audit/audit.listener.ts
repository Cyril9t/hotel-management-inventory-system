import { eventBus } from "#shared/events/bus";
import { auditService } from "./audit.service";
import { logger } from "#shared/logger";

export function registerAuditListeners() {
  // ---- users ----
  eventBus.on("user.deactivated", ({ userId, actorUserId, wasActive }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "user_deactivated",
        entityType: "User",
        entityId: userId,
        beforeValue: { isActive: wasActive },
        afterValue: { isActive: false },
      }),
    );
  });

  eventBus.on("user.reactivated", ({ userId, actorUserId, wasActive }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "user_reactivated",
        entityType: "User",
        entityId: userId,
        beforeValue: { isActive: wasActive },
        afterValue: { isActive: true },
      }),
    );
  });

  eventBus.on(
    "staffInvite.created",
    ({ inviteId, actorUserId, email, role }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "staff_invite_created",
          entityType: "StaffInvite",
          entityId: inviteId,
          afterValue: { email, role },
        }),
      );
    },
  );

  eventBus.on("staffInvite.resent", ({ inviteId, actorUserId, email }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "staff_invite_resent",
        entityType: "StaffInvite",
        entityId: inviteId,
        afterValue: { email },
      }),
    );
  });

  eventBus.on("staffInvite.accepted", ({ inviteId, userId, role }) => {
    safeLog(() =>
      auditService.log({
        actorUserId: userId, // the invitee themselves accepted — they're the actor here
        action: "staff_invite_accepted",
        entityType: "StaffInvite",
        entityId: inviteId,
        afterValue: { userId, role },
      }),
    );
  });

  // ---- auth ----
  eventBus.on("user.passwordReset", ({ userId }) => {
    safeLog(() =>
      auditService.log({
        actorUserId: userId,
        action: "password_reset",
        entityType: "User",
        entityId: userId,
      }),
    );
  });

  // ---- rooms ----
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

  eventBus.on("room.created", ({ roomId, actorUserId, number, categoryId }) => {
    safeLog(() =>
      auditService.log({
        actorUserId,
        action: "room_created",
        entityType: "Room",
        entityId: roomId,
        afterValue: { number, categoryId },
      }),
    );
  });

  eventBus.on(
    "roomCategory.created",
    ({ categoryId, actorUserId, name, pricePerNight }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "room_category_created",
          entityType: "RoomCategory",
          entityId: categoryId,
          afterValue: { name, pricePerNight },
        }),
      );
    },
  );

  eventBus.on(
    "rooms.bulkCreated",
    ({ actorUserId, categoryId, requested, created }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "rooms_bulk_created",
          entityType: "RoomCategory",
          entityId: categoryId,
          afterValue: { requested, created },
        }),
      );
    },
  );

  // ---- bookings ----
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
    "booking.created",
    ({ bookingId, actorUserId, roomId, totalPrice, paymentMethod }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "booking_created",
          entityType: "Booking",
          entityId: bookingId,
          afterValue: { roomId, totalPrice, paymentMethod },
        }),
      );
    },
  );

  // ---- payments ----
  eventBus.on(
    "payment.recorded",
    ({ paymentId, bookingId, actorUserId, amount, method, shiftId }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "payment_recorded",
          entityType: "Payment",
          entityId: paymentId,
          afterValue: { bookingId, amount, method, shiftId },
        }),
      );
    },
  );

  // ---- shifts ----
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
    "shift.opened",
    ({ shiftId, actorUserId, department, openingCash }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "shift_opened",
          entityType: "Shift",
          entityId: shiftId,
          afterValue: { department, openingCash },
        }),
      );
    },
  );

  // ---- orders ----
  eventBus.on(
    "sale.created",
    ({
      saleId,
      actorUserId,
      sourceDepartment,
      totalAmount,
      paymentMethod,
      kitchenOrderId,
    }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "sale_created",
          entityType: "Sale",
          entityId: saleId,
          afterValue: {
            sourceDepartment,
            totalAmount,
            paymentMethod,
            kitchenOrderId,
          },
        }),
      );
    },
  );

  eventBus.on(
    "sale.voidRequested",
    ({ saleId, actorUserId, sourceDepartment, totalAmount, voidReason }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "sale_void_requested",
          entityType: "Sale",
          entityId: saleId,
          beforeValue: { status: "COMPLETED" },
          afterValue: {
            status: "VOID_REQUESTED",
            sourceDepartment,
            totalAmount,
            voidReason,
          },
        }),
      );
    },
  );

  eventBus.on(
    "sale.voidApproved",
    ({
      saleId,
      actorUserId,
      requestedByUserId,
      sourceDepartment,
      totalAmount,
    }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "sale_void_approved",
          entityType: "Sale",
          entityId: saleId,
          beforeValue: { status: "VOID_REQUESTED", requestedByUserId },
          afterValue: { status: "VOIDED", sourceDepartment, totalAmount },
        }),
      );
    },
  );

  eventBus.on(
    "sale.settled",
    ({ saleId, actorUserId, chargeToRoomBookingId, totalAmount }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "sale_settled",
          entityType: "Sale",
          entityId: saleId,
          beforeValue: { paymentState: "UNPAID" },
          afterValue: {
            paymentState: "PAID",
            chargeToRoomBookingId,
            totalAmount,
          },
        }),
      );
    },
  );
  // kitchenOrder.statusChanged intentionally NOT subscribed here — see types.ts comment

  // ---- stock ----
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

  eventBus.on(
    "stock.correctionApplied",
    ({ productId, department, actorUserId, adjustment, correctionReason }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "manual_stock_correction",
          entityType: "Product",
          entityId: productId,
          afterValue: { department, adjustment, reason: correctionReason },
        }),
      );
    },
  );

  eventBus.on(
    "stock.received",
    ({ movementId, productId, actorUserId, quantity }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "stock_received",
          entityType: "StockMovement",
          entityId: movementId,
          afterValue: { productId, toDepartment: "STORE", quantity },
        }),
      );
    },
  );

  eventBus.on(
    "stock.issued",
    ({
      movementId,
      productId,
      actorUserId,
      fromDepartment,
      toDepartment,
      quantity,
    }) => {
      safeLog(() =>
        auditService.log({
          actorUserId,
          action: "stock_issued",
          entityType: "StockMovement",
          entityId: movementId,
          afterValue: { productId, fromDepartment, toDepartment, quantity },
        }),
      );
    },
  );

  // stock.acknowledged intentionally NOT subscribed here — see types.ts comment
}

function safeLog(fn: () => unknown) {
  try {
    fn();
  } catch (err) {
    logger.error({ err }, "audit listener failed");
  }
}
