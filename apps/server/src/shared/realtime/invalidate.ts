import { eventBus } from "#shared/events/bus";
import { io } from "./socket";
import { logger } from "#shared/logger";

export function registerRealtimeListeners() {
  // ---- rooms ----
  eventBus.on("room.deactivated", () => {
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "rooms" }));
  });

  eventBus.on("room.reactivated", () => {
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "rooms" }));
  });

  eventBus.on("room.categoryPriceChanged", () => {
    safeEmit(() =>
      io.to("RECEPTION").to("management").emit("invalidate", { key: "rooms" }),
    );
  });

  eventBus.on("room.categoryNameChanged", () => {
    safeEmit(() =>
      io.to("RECEPTION").to("management").emit("invalidate", { key: "rooms" }),
    );
  });

  // ---- bookings ----
  eventBus.on("booking.manualCheckout", () => {
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "bookings" }));
  });

  // ---- shifts ----
  eventBus.on("shift.closed", () => {
    safeEmit(() => io.to("management").emit("invalidate", { key: "shifts" }));
  });

  // ---- orders ----
  eventBus.on("kitchenOrder.statusChanged", ({ destination }) => {
    safeEmit(() =>
      io.to(destination).emit("invalidate", { key: "kitchenOrders" }),
    );
  });

  // ---- stock ----
  eventBus.on("product.deactivated", ({ department }) => {
    safeEmit(() =>
      io
        .to(department)
        .to("management")
        .emit("invalidate", { key: "products" }),
    );
  });

  eventBus.on("product.reactivated", ({ department }) => {
    safeEmit(() =>
      io
        .to(department)
        .to("management")
        .emit("invalidate", { key: "products" }),
    );
  });

  eventBus.on("stock.acknowledged", ({ department }) => {
    safeEmit(() =>
      io.to(department).to("management").emit("invalidate", { key: "stock" }),
    );
  });

  eventBus.on("stock.issueDiscrepancy", () => {
    safeEmit(() =>
      io
        .to("KITCHEN")
        .to("management")
        .emit("invalidate", { key: "stockMovements" }),
    );
  });
}

function safeEmit(fn: () => unknown) {
  try {
    fn();
  } catch (err) {
    logger.error({ err }, "realtime listener failed");
  }
}
