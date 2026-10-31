import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import {
  createBookingSchema,
  bookingIdParamsSchema,
  listBookingsQuerySchema,
  createBookingPaymentSchema,

  // success responses
  bookingCreatedResponseSchema,
  bookingsListResponseSchema,
  bookingDetailsResponseSchema,
  bookingCheckInResponseSchema,
  bookingCheckoutResponseSchema,
  bookingPaymentCreatedResponseSchema,
  bookingPaymentsListResponseSchema,
  bookingBalanceResponseSchema,

  // error responses
  openShiftRequiredResponse,
  roomAlreadyBookedResponse,
  roomNotFoundResponse,
  bookingNotFoundResponse,
  invalidCheckInStatusResponse,
  invalidCheckoutStatusResponse,
  paymentShiftRequiredResponse,
  bookingAlreadyPaidResponse,
  bookingDynamicBadRequestResponse,
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
      content: {
        "application/json": {
          schema: bookingCreatedResponseSchema,
        },
      },
    },
    400: {
      description:
        "An open shift is required or the room already has an active booking",
      content: {
        "application/json": {
          schema: openShiftRequiredResponse.or(roomAlreadyBookedResponse),
        },
      },
    },
    404: {
      description: "Room not found",
      content: {
        "application/json": {
          schema: roomNotFoundResponse,
        },
      },
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
    "Retrieves bookings with optional filters for room ID, booking status, and date range.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listBookingsQuerySchema,
  },
  responses: {
    200: {
      description: "Bookings retrieved successfully",
      content: {
        "application/json": {
          schema: bookingsListResponseSchema,
        },
      },
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
      description: "Booking details retrieved successfully",
      content: {
        "application/json": {
          schema: bookingDetailsResponseSchema,
        },
      },
    },
    404: {
      description: "Booking not found",
      content: {
        "application/json": {
          schema: bookingNotFoundResponse,
        },
      },
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
      description: "Guest checked in successfully",
      content: {
        "application/json": {
          schema: bookingCheckInResponseSchema,
        },
      },
    },
    400: {
      description: "Only reserved bookings can be checked in",
      content: {
        "application/json": {
          schema: invalidCheckInStatusResponse,
        },
      },
    },
    404: {
      description: "Booking not found",
      content: {
        "application/json": {
          schema: bookingNotFoundResponse,
        },
      },
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
      description: "Guest checked out successfully",
      content: {
        "application/json": {
          schema: bookingCheckoutResponseSchema,
        },
      },
    },
    400: {
      description:
        "Booking cannot be checked out in its current state or has unpaid charge-to-room sales",
      content: {
        "application/json": {
          schema: invalidCheckoutStatusResponse.or(
            bookingDynamicBadRequestResponse,
          ),
        },
      },
    },
    404: {
      description: "Booking not found",
      content: {
        "application/json": {
          schema: bookingNotFoundResponse,
        },
      },
    },
  },
});

bookingsRoutes.post(
  "/:id/checkout",
  authorize("update", "Booking"),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.checkout,
);

// POST /bookings/:id/payments
registry.registerPath({
  method: "post",
  path: "/bookings/{id}/payments",
  tags: ["Bookings"],
  summary: "Record a booking payment",
  description:
    "Records a payment against a specific booking. Requires permission to create payments.",
  security: [{ bearerAuth: [] }],
  request: {
    params: bookingIdParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: createBookingPaymentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Payment recorded successfully",
      content: {
        "application/json": {
          schema: bookingPaymentCreatedResponseSchema,
        },
      },
    },
    400: {
      description:
        "Payment cannot be recorded because of an invalid payment state or amount",
      content: {
        "application/json": {
          schema: paymentShiftRequiredResponse
            .or(bookingAlreadyPaidResponse)
            .or(bookingDynamicBadRequestResponse),
        },
      },
    },
    404: {
      description: "Booking not found",
      content: {
        "application/json": {
          schema: bookingNotFoundResponse,
        },
      },
    },
  },
});

bookingsRoutes.post(
  "/:id/payments",
  authorize("create", "Payment"),
  validate({ params: bookingIdParamsSchema, body: createBookingPaymentSchema }),
  bookingsController.createPayment,
);

// GET /bookings/:id/payments
registry.registerPath({
  method: "get",
  path: "/bookings/{id}/payments",
  tags: ["Bookings"],
  summary: "List booking payments",
  description: "Retrieves all payments associated with a specific booking.",
  security: [{ bearerAuth: [] }],
  request: {
    params: bookingIdParamsSchema,
  },
  responses: {
    200: {
      description: "Booking payments retrieved successfully",
      content: {
        "application/json": {
          schema: bookingPaymentsListResponseSchema,
        },
      },
    },
  },
});

bookingsRoutes.get(
  "/:id/payments",
  authorize("read", "Payment"),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.listPayments,
);

// GET /bookings/:id/payments/balance
registry.registerPath({
  method: "get",
  path: "/bookings/{id}/payments/balance",
  tags: ["Bookings"],
  summary: "Get booking payment balance",
  description:
    "Retrieves the payment summary for a booking, including the total booking amount, amount paid, and outstanding balance.",
  security: [{ bearerAuth: [] }],
  request: {
    params: bookingIdParamsSchema,
  },
  responses: {
    200: {
      description: "Booking payment balance retrieved successfully",
      content: {
        "application/json": {
          schema: bookingBalanceResponseSchema,
        },
      },
    },
    404: {
      description: "Booking not found",
      content: {
        "application/json": {
          schema: bookingNotFoundResponse,
        },
      },
    },
  },
});

bookingsRoutes.get(
  "/:id/payments/balance",
  authorize("read", "Payment"),
  validate({ params: bookingIdParamsSchema }),
  bookingsController.getBalance,
);
