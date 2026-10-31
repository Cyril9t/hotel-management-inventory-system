import { BookingStatus } from "@prisma/client";
import { z } from "zod";
import { apiSuccessSchema } from "#shared/utils/api-response";
import {
  notFoundErrorSchema,
  badRequestErrorSchema,
  forbiddenErrorSchema,
  unauthorizedErrorSchema,
} from "#shared/errors/http-error-schemas";

export const createRoomSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  categoryId: z.uuid("Invalid room category id"),
});

export const updateRoomSchema = createRoomSchema.partial();

export const roomIdParamsSchema = z.object({
  id: z.uuid("Invalid room id"),
});

export const categoryIdParamsSchema = z.object({
  categoryId: z.uuid("Invalid room category id"),
});

export const updateCategoryPriceSchema = z.object({
  price: z.coerce.number().positive("Price must be a positive number"),
});

export const updateCategoryNameSchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  pricePerNight: z.coerce.number().positive("Price must be a positive number"),
});

export const bulkCreateRoomsSchema = z
  .object({
    categoryId: z.uuid("Invalid room category id"),
    wing: z
      .string()
      .length(1, "Wing must be a single letter")
      .regex(/^[A-Za-z]$/, "Wing must be a letter")
      .optional(),
    floor: z.coerce.number().int().positive().optional(),
    rangeStart: z.coerce.number().int().positive(),
    rangeEnd: z.coerce.number().int().positive(),
  })
  .refine((data) => data.rangeEnd >= data.rangeStart, {
    message: "rangeEnd must be greater than or equal to rangeStart",
    path: ["rangeEnd"],
  });

export const listRoomsQuerySchema = z.object({
  categoryId: z.uuid("Invalid room category id").optional(),
  status: z.enum(BookingStatus, "Invalid status").optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateRoomBody = z.infer<typeof createRoomSchema>;
export type UpdateRoomBody = z.infer<typeof updateRoomSchema>;
export type RoomIdParams = z.infer<typeof roomIdParamsSchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
export type UpdateCategoryPriceBody = z.infer<typeof updateCategoryPriceSchema>;
export type UpdateCategoryNameBody = z.infer<typeof updateCategoryNameSchema>;
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type BulkCreateRoomsBody = z.infer<typeof bulkCreateRoomsSchema>;
export type ListRoomsQuery = z.infer<typeof listRoomsQuerySchema>;

// Record schemas

export const roomCategoryRecordSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  pricePerNight: z.string(),
});

export const roomRecordSchema = z.object({
  id: z.uuid(),
  number: z.string(),
  categoryId: z.uuid(),
  isActive: z.boolean(),
});

export const roomWithCategorySchema = roomRecordSchema.extend({
  category: roomCategoryRecordSchema,
});

export const roomWithStatusSchema = roomWithCategorySchema.extend({
  status: z.union([z.enum(BookingStatus), z.literal("AVAILABLE")]),
});

// Success responses

export const roomsListResponseSchema = apiSuccessSchema(
  z.object({
    rooms: z.array(roomWithStatusSchema),
  }),
);

export const roomDetailsResponseSchema = apiSuccessSchema(
  z.object({
    room: roomWithStatusSchema,
  }),
);

export const roomCreatedResponseSchema = apiSuccessSchema(
  z.object({
    room: roomWithCategorySchema,
  }),
);

export const roomUpdatedResponseSchema = apiSuccessSchema(
  z.object({
    room: roomWithCategorySchema,
  }),
);

export const roomDeactivatedResponseSchema = apiSuccessSchema(
  z.object({
    room: roomRecordSchema,
  }),
);

export const roomReactivatedResponseSchema = apiSuccessSchema(
  z.object({
    room: roomRecordSchema,
  }),
);

export const roomCategoryPriceUpdatedResponseSchema = apiSuccessSchema(
  z.object({
    room: roomCategoryRecordSchema,
  }),
);

export const roomCategoryNameUpdatedResponseSchema = apiSuccessSchema(
  z.object({
    category: roomCategoryRecordSchema,
  }),
);

export const roomCategoriesListResponseSchema = apiSuccessSchema(
  z.object({
    categories: z.array(roomCategoryRecordSchema),
  }),
);

export const roomCategoryCreatedResponseSchema = apiSuccessSchema(
  z.object({
    category: roomCategoryRecordSchema,
  }),
);

export const roomsBulkCreatedResponseSchema = apiSuccessSchema(
  z.object({
    requested: z.number().int(),
    created: z.number().int(),
    skipped: z.number().int(),
  }),
);

// Error responses

// Generic errors
export const roomsBadRequestResponse = badRequestErrorSchema("Bad request");
export const roomsUnauthorizedResponse =
  unauthorizedErrorSchema("Unauthorized");
export const roomsForbiddenResponse = forbiddenErrorSchema("Forbidden");

// Specific errors
export const roomNotFoundResponse = notFoundErrorSchema("Room not found");

export const roomCategoryNotFoundResponse = notFoundErrorSchema(
  "Room category not found",
);

export const duplicateCategoryNameResponse = badRequestErrorSchema(
  "A category with that name already exists",
);
