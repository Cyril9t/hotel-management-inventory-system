import { z } from "zod";
import { BookingStatus, PaymentMethod } from "@prisma/client";
import {
  dateRangeShape,
  dateRangeRefinement,
} from "#shared/utils/date-range-schema";
import { apiSuccessSchema } from "#shared/utils/api-response";
import {
  badRequestErrorSchema,
  notFoundErrorSchema,
} from "#shared/errors/http-error-schemas";

export const createBookingSchema = z.object({
  roomId: z.uuid("Invalid room id"),
  guestFirstName: z.string().min(1, "Guest first name is required"),
  guestLastName: z.string().min(1, "Guest last name is required"),
  guestPhone: z.string().min(1, "Guest phone is required"),
  guestGender: z.string().min(1, "Guest gender is required"),
  nights: z.coerce.number().int().positive("Nights must be a positive number"),
  expectedCheckoutAt: z.coerce.date(),
  paymentMethod: z.enum(PaymentMethod, "Payment method is required"),
  checkInNow: z.boolean().optional().default(false),
});

export const bookingIdParamsSchema = z.object({
  id: z.uuid("Invalid booking id"),
});

export const listBookingsQuerySchema = z
  .object({
    roomId: z.uuid("Room ID must be a valid UUID").optional(),
    status: z.enum(BookingStatus, "Invalid booking status").optional(),
    ...dateRangeShape,
  })
  .refine(dateRangeRefinement, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const createBookingPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number"),
  method: z.enum(["CASH", "TRANSFER", "CARD"], "Payment method is required"),
});

export type CreateBookingBody = z.infer<typeof createBookingSchema>;
export type BookingIdParams = z.infer<typeof bookingIdParamsSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type CreateBookingPaymentBody = z.infer<
  typeof createBookingPaymentSchema
>;

// response object schemas

const roomCategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  pricePerNight: z.string(),
});

const roomRecordSchema = z.object({
  id: z.uuid(),
  number: z.string(),
  categoryId: z.uuid(),
  isActive: z.boolean(),
  category: roomCategorySchema,
});

const bookingRecordSchema = z.object({
  id: z.uuid(),
  roomId: z.uuid(),
  guestFirstName: z.string(),
  guestLastName: z.string(),
  guestPhone: z.string(),
  guestGender: z.string(),
  nights: z.number().int(),
  pricePerNightAtBooking: z.string(),
  totalPrice: z.string(),
  paymentMethod: z.enum(PaymentMethod),
  checkInAt: z.iso.datetime().nullable(),
  expectedCheckoutAt: z.iso.datetime(),
  actualCheckoutAt: z.iso.datetime().nullable(),
  status: z.enum(BookingStatus),
  createdByUserId: z.uuid(),
  shiftId: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
});

const bookingWithRoomSchema = bookingRecordSchema.extend({
  room: roomRecordSchema,
});

const paymentRecordSchema = z.object({
  id: z.uuid(),
  amount: z.string(),
  method: z.enum(PaymentMethod),
  bookingId: z.uuid().nullable(),
  saleId: z.uuid().nullable(),
  receivedByUserId: z.uuid(),
  shiftId: z.uuid(),
  paidAt: z.iso.datetime(),
});

// success response schema

// POST /bookings
export const bookingCreatedResponseSchema = apiSuccessSchema(
  z.object({
    booking: bookingRecordSchema,
  }),
);

// GET /bookings
export const bookingsListResponseSchema = apiSuccessSchema(
  z.object({
    bookings: z.array(bookingWithRoomSchema),
  }),
);

// GET /bookings/:id
export const bookingDetailsResponseSchema = apiSuccessSchema(
  z.object({
    booking: bookingWithRoomSchema,
  }),
);

// POST /bookings/:id/check-in
export const bookingCheckInResponseSchema = apiSuccessSchema(
  z.object({
    booking: bookingRecordSchema,
  }),
);

// POST /bookings/:id/checkout
export const bookingCheckoutResponseSchema = apiSuccessSchema(
  z.object({
    booking: bookingRecordSchema,
  }),
);

// POST /bookings/:id/payments
export const bookingPaymentCreatedResponseSchema = apiSuccessSchema(
  z.object({
    payment: paymentRecordSchema,
  }),
);

// GET /bookings/:id/payments
export const bookingPaymentsListResponseSchema = apiSuccessSchema(
  z.object({
    payments: z.array(paymentRecordSchema),
  }),
);

// GET /bookings/:id/payments/balance
export const bookingBalanceResponseSchema = apiSuccessSchema(
  z.object({
    balance: z.object({
      totalPrice: z.number(),
      totalPaid: z.number(),
      balance: z.number(),
      isFullyPaid: z.boolean(),
    }),
  }),
);

// error response schema

// Booking creation
export const openShiftRequiredResponse = badRequestErrorSchema(
  "Open a shift before creating a booking",
);

export const roomAlreadyBookedResponse = badRequestErrorSchema(
  "Room already has an active booking",
);

export const roomNotFoundResponse = notFoundErrorSchema("Room not found");

// Booking operations
export const bookingNotFoundResponse = notFoundErrorSchema("Booking not found");

export const invalidCheckInStatusResponse = badRequestErrorSchema(
  "Only reserved bookings can be checked in",
);

export const invalidCheckoutStatusResponse = badRequestErrorSchema(
  "Booking is not in a checkout-eligible state",
);

// Payment operations
export const paymentShiftRequiredResponse = badRequestErrorSchema(
  "Open a shift before recording a payment",
);

export const bookingAlreadyPaidResponse = badRequestErrorSchema(
  "Booking is already fully paid",
);

// Dynamic messages: excess payment and unpaid charge-to-room sales.
export const bookingDynamicBadRequestResponse =
  badRequestErrorSchema("Bad request");
