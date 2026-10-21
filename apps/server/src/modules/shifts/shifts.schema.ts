import { z } from "zod";
import { Department, ShiftStatus } from "@prisma/client";

export const openShiftSchema = z.object({
  openingCash: z.coerce.number().nonnegative("Opening cash cannot be negative"),
});

export const closeShiftSchema = z.object({
  actualCash: z.coerce.number().nonnegative("Actual cash cannot be negative"),
});

export const shiftIdParamsSchema = z.object({
  id: z.uuid("Invalid shift id"),
});

export const listShiftsQuerySchema = z.object({
  userId: z.uuid("User ID must be a valid UUID").optional(),
  department: z.enum(Department, "Invalid department").optional(),
  status: z.enum(ShiftStatus, "Invalid shift status").optional(),
});

export type OpenShiftBody = z.infer<typeof openShiftSchema>;
export type CloseShiftBody = z.infer<typeof closeShiftSchema>;
export type ShiftIdParams = z.infer<typeof shiftIdParamsSchema>;
export type ListShiftsQuery = z.infer<typeof listShiftsQuerySchema>;
