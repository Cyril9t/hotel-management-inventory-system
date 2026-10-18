import { BookingStatus } from "node_modules/@prisma/client";
import { z } from "zod";

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
