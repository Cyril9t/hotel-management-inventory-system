import { bookingsService } from "#modules/bookings/bookings.service";
import { logger } from "#shared/logger";

export async function processAutoCheckout() {
  const result = await bookingsService.transitionCheckoutStatuses();
  logger.info(result, "auto-checkout sweep completed");
}
