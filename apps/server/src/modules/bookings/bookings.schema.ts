import { z } from "zod";
import { BookingStatus, PaymentMethod } from "@prisma/client";
import {
  dateRangeShape,
  dateRangeRefinement,
} from "#shared/utils/date-range-schema";

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
