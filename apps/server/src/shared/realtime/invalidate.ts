import { eventBus } from "#shared/events/bus";
import { io } from "./socket";
import { logger } from "#shared/logger";

export function registerRealtimeListeners() {
  eventBus.on("kitchenOrder.statusChanged", ({ destination }) => {
    safeEmit(() =>
      io.to(destination).emit("invalidate", { key: "kitchenOrders" }),
    );
  });

  eventBus.on("booking.checkedOut", () => {
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "bookings" }));
  });

  eventBus.on("room.deactivated", () => {
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "rooms" }));
  });

  eventBus.on("room.reactivated", () => {
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "rooms" }));
  });

  eventBus.on("stock.correctionApplied", ({ department }) => {
    safeEmit(() =>
      io.to(department).to("management").emit("invalidate", { key: "stock" }),
    );
  });

  eventBus.on("room.deactivated", () =>
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "rooms" })),
  );

  eventBus.on("room.reactivated", () =>
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "rooms" })),
  );

  eventBus.on("room.categoryPriceChanged", () =>
    safeEmit(() =>
      io.to("RECEPTION").to("management").emit("invalidate", { key: "rooms" }),
    ),
  );

  eventBus.on("room.categoryNameChanged", () =>
    safeEmit(() =>
      io.to("RECEPTION").to("management").emit("invalidate", { key: "rooms" }),
    ),
  );

  eventBus.on("shift.closed", () =>
    safeEmit(() => io.to("management").emit("invalidate", { key: "shifts" })),
  );

  eventBus.on("booking.manualCheckout", () =>
    safeEmit(() => io.to("RECEPTION").emit("invalidate", { key: "bookings" })),
  );
}

function safeEmit(fn: () => unknown) {
  try {
    fn();
  } catch (err) {
    logger.error({ err }, "realtime listener failed");
  }
}
