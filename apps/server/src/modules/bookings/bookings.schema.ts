import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

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

export type CreateBookingBody = z.infer<typeof createBookingSchema>;
export type BookingIdParams = z.infer<typeof bookingIdParamsSchema>;
