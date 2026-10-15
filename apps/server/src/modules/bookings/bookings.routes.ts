import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { createBookingSchema, bookingIdParamsSchema } from "./bookings.schema";
import type { Role } from "@prisma/client";

export const bookingsRoutes = Router();

bookingsRoutes.use(authenticate);

const STAFF = ["RECEPTIONIST", "GENERAL_MANAGER", "OWNER"] as Role[];

bookingsRoutes.post(
  "/",
  authorize(STAFF),
  validate({ body: createBookingSchema }),
  bookingsController.create,
);
bookingsRoutes.get(
  "/:id",
  authorize(STAFF),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.getById,
);
bookingsRoutes.post(
  "/:id/check-in",
  authorize(STAFF),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.checkIn,
);
bookingsRoutes.post(
  "/:id/checkout",
  authorize(STAFF),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.checkout,
);
