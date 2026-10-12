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

export type CreateRoomBody = z.infer<typeof createRoomSchema>;
export type UpdateRoomBody = z.infer<typeof updateRoomSchema>;
export type RoomIdParams = z.infer<typeof roomIdParamsSchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
export type UpdateCategoryPriceBody = z.infer<typeof updateCategoryPriceSchema>;
