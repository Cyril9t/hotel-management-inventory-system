import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { apiSuccessSchema, apiFailureSchema } from "#shared/utils/api-response";
import {
  createBookingSchema,
  bookingIdParamsSchema,
  listBookingsQuerySchema,
} from "./bookings.schema";

export const bookingsRoutes = Router();

bookingsRoutes.use(authenticate);

// POST /bookings
registry.registerPath({
  method: "post",
  path: "/bookings",
  tags: ["Bookings"],
  summary: "Book a room",
  description:
    "Creates a new booking for a room. Checks for existing active bookings and calculates total price based on current room category price.",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createBookingSchema } } },
  },
  responses: {
    201: {
      description: "Booking created successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data or room already has an active booking",
      content: { "application/json": { schema: apiFailureSchema } },
    },
    404: {
      description: "Room not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

bookingsRoutes.post(
  "/",
  authorize("create", "Booking"),
  validate({ body: createBookingSchema }),
  bookingsController.create,
);

// GET /bookings
registry.registerPath({
  method: "get",
  path: "/bookings",
  tags: ["Bookings"],
  summary: "List bookings",
  description:
    "Retrieves a list of bookings, optionally filtered by room ID or status.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listBookingsQuerySchema,
  },
  responses: {
    200: {
      description: "List of bookings retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});

bookingsRoutes.get(
  "/",
  authorize("read", "Booking"),
  validate({ query: listBookingsQuerySchema }),
  bookingsController.list,
);

// GET /bookings/:id
registry.registerPath({
  method: "get",
  path: "/bookings/{id}",
  tags: ["Bookings"],
  summary: "Get booking details",
  description:
    "Retrieves detailed information about a specific booking by its ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: bookingIdParamsSchema,
  },
  responses: {
    200: {
      description: "Booking details retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Booking not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

bookingsRoutes.get(
  "/:id",
  authorize("read", "Booking"),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.getById,
);

// POST /bookings/:id/check-in
registry.registerPath({
  method: "post",
  path: "/bookings/{id}/check-in",
  tags: ["Bookings"],
  summary: "Check in a guest",
  description:
    "Marks a reserved booking as checked-in. Only bookings with 'RESERVED' status can be checked in.",
  security: [{ bearerAuth: [] }],
  request: {
    params: bookingIdParamsSchema,
  },
  responses: {
    200: {
      description: "Check-in successful",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid booking state for check-in",
      content: { "application/json": { schema: apiFailureSchema } },
    },
    404: {
      description: "Booking not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

bookingsRoutes.post(
  "/:id/check-in",
  authorize("update", "Booking"),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.checkIn,
);

// POST /bookings/:id/checkout
registry.registerPath({
  method: "post",
  path: "/bookings/{id}/checkout",
  tags: ["Bookings"],
  summary: "Check out a guest",
  description:
    "Marks a booking as checked-out. Eligible statuses include CHECKED_IN, CHECKOUT_DUE, and OVERDUE.",
  security: [{ bearerAuth: [] }],
  request: {
    params: bookingIdParamsSchema,
  },
  responses: {
    200: {
      description: "Check-out successful",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid booking state for check-out",
      content: { "application/json": { schema: apiFailureSchema } },
    },
    404: {
      description: "Booking not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

bookingsRoutes.post(
  "/:id/checkout",
  authorize("update", "Booking"),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.checkout,
);
