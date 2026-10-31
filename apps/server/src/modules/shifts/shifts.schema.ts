import { z } from "zod";
import { Department, ShiftStatus } from "@prisma/client";
import { apiSuccessSchema } from "#shared/utils/api-response";
import {
  badRequestErrorSchema,
  notFoundErrorSchema,
  forbiddenErrorSchema,
} from "#shared/errors/http-error-schemas";

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

// response object schemas

const roomSnapshotItemSchema = z.object({
  id: z.uuid(),
  number: z.string(),
  status: z.string(),
});

const receptionSnapshotSchema = z.object({
  id: z.uuid(),
  shiftId: z.uuid(),
  roomSnapshotOpen: z.array(roomSnapshotItemSchema),
  roomSnapshotClose: z.array(roomSnapshotItemSchema).nullable(),
});

const shiftRecordSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  department: z.enum(Department),
  openedAt: z.iso.datetime(),
  closedAt: z.iso.datetime().nullable(),
  openingCash: z.string(),
  expectedCash: z.string().nullable(),
  actualCash: z.string().nullable(),
  variance: z.string().nullable(),
  status: z.enum(ShiftStatus),
});

const currentShiftRecordSchema = shiftRecordSchema
  .omit({ expectedCash: true })
  .extend({
    expectedCash: z.number(),
  });

const shiftWithSnapshotSchema = shiftRecordSchema.extend({
  receptionSnapshot: receptionSnapshotSchema.nullable(),
});

// success response schemas

// GET /shifts/current
export const currentShiftResponseSchema = apiSuccessSchema(
  z.object({
    shift: currentShiftRecordSchema,
  }),
);

// GET /shifts/suggested-opening-cash
export const suggestedOpeningCashResponseSchema = apiSuccessSchema(
  z.object({
    suggestedOpeningCash: z.union([z.string(), z.number()]),
  }),
);

// POST /shifts/open
export const shiftOpenedResponseSchema = apiSuccessSchema(
  z.object({
    shift: shiftRecordSchema,
  }),
);

// PATCH /shifts/:id/close
export const shiftClosedResponseSchema = apiSuccessSchema(
  z.object({
    shift: shiftRecordSchema,
  }),
);

// GET /shifts/:id
export const shiftDetailsResponseSchema = apiSuccessSchema(
  z.object({
    shift: shiftWithSnapshotSchema,
  }),
);

// GET /shifts
export const shiftsListResponseSchema = apiSuccessSchema(
  z.object({
    shifts: z.array(shiftRecordSchema),
  }),
);

// error response schemas

// Opening a shift
export const shiftAlreadyOpenResponse = badRequestErrorSchema(
  "You already have an open shift",
);

export const userDepartmentMissingResponse = badRequestErrorSchema(
  "User has no department assigned",
);

// Shift operations
export const shiftNotFoundResponse = notFoundErrorSchema("Shift not found");

export const noOpenShiftResponse = notFoundErrorSchema("No open shift found");

export const shiftAlreadyClosedResponse = badRequestErrorSchema(
  "Shift is already closed",
);

export const cannotCloseShiftResponse = forbiddenErrorSchema(
  "You cannot close this shift",
);

export const cannotViewShiftResponse = forbiddenErrorSchema(
  "You cannot view this shift",
);

// Dynamic message: actual cash exceeds expected cash.
export const shiftDynamicBadRequestResponse =
  badRequestErrorSchema("Bad request");
