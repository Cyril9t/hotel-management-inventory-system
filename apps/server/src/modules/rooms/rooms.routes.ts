import { Router } from "express";
import { roomsController } from "./rooms.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { apiSuccessSchema, apiFailureSchema } from "#shared/utils/api-response";
import {
  createRoomSchema,
  updateRoomSchema,
  roomIdParamsSchema,
  categoryIdParamsSchema,
  updateCategoryPriceSchema,
  updateCategoryNameSchema,
  createCategorySchema,
  bulkCreateRoomsSchema,
} from "./rooms.schema";
import type { Role } from "@prisma/client";

export const roomsRoutes = Router();

roomsRoutes.use(authenticate);

const MANAGEMENT: Role[] = ["GENERAL_MANAGER", "OWNER"];
const STAFF: Role[] = ["RECEPTIONIST", "GENERAL_MANAGER", "OWNER"];

// GET /rooms
registry.registerPath({
  method: "get",
  path: "/rooms",
  tags: ["Rooms"],
  summary: "List rooms",
  description:
    "Retrieves a list of all rooms with their current availability status.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of rooms retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});

roomsRoutes.get("/", authorize(STAFF), roomsController.list);

// GET /rooms/categories
registry.registerPath({
  method: "get",
  path: "/rooms/categories",
  tags: ["Rooms"],
  summary: "List room categories",
  description: "Retrieves all available room categories and their pricing.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of categories retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});

roomsRoutes.get(
  "/categories",
  authorize(STAFF),
  roomsController.listCategories,
);

// GET /rooms/:id
registry.registerPath({
  method: "get",
  path: "/rooms/{id}",
  tags: ["Rooms"],
  summary: "Get room details",
  description:
    "Retrieves detailed information about a specific room by its ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: roomIdParamsSchema,
  },
  responses: {
    200: {
      description: "Room details retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Room not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.get(
  "/:id",
  authorize(STAFF),
  validate({ params: roomIdParamsSchema }),
  roomsController.getById,
);

// POST /rooms
registry.registerPath({
  method: "post",
  path: "/rooms",
  tags: ["Rooms"],
  summary: "Create a new room",
  description: "Adds a new room to the system. Requires a valid category ID.",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createRoomSchema } } },
  },
  responses: {
    201: {
      description: "Room created successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: apiFailureSchema } },
    },
    404: {
      description: "Room category not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.post(
  "/",
  authorize(MANAGEMENT),
  validate({ body: createRoomSchema }),
  roomsController.create,
);

// PATCH /rooms/:id
registry.registerPath({
  method: "patch",
  path: "/rooms/{id}",
  tags: ["Rooms"],
  summary: "Update room details",
  description:
    "Updates room number or category. Validates that the room exists.",
  security: [{ bearerAuth: [] }],
  request: {
    params: roomIdParamsSchema,
    body: { content: { "application/json": { schema: updateRoomSchema } } },
  },
  responses: {
    200: {
      description: "Room updated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Room not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.patch(
  "/:id",
  authorize(MANAGEMENT),
  validate({ params: roomIdParamsSchema, body: updateRoomSchema }),
  roomsController.update,
);

// PATCH /rooms/:id/deactivate
registry.registerPath({
  method: "patch",
  path: "/rooms/{id}/deactivate",
  tags: ["Rooms"],
  summary: "Deactivate a room",
  description: "Soft deletes a room, making it unavailable for bookings.",
  security: [{ bearerAuth: [] }],
  request: {
    params: roomIdParamsSchema,
  },
  responses: {
    200: {
      description: "Room deactivated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Room not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.patch(
  "/:id/deactivate",
  authorize(MANAGEMENT),
  validate({ params: roomIdParamsSchema }),
  roomsController.deactivate,
);

// PATCH /rooms/:id/reactivate
registry.registerPath({
  method: "patch",
  path: "/rooms/{id}/reactivate",
  tags: ["Rooms"],
  summary: "Reactivate a room",
  description: "Reactivates a deactivated room.",
  security: [{ bearerAuth: [] }],
  request: {
    params: roomIdParamsSchema,
  },
  responses: {
    200: {
      description: "Room reactivated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Room not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.patch(
  "/:id/reactivate",
  authorize(MANAGEMENT),
  validate({ params: roomIdParamsSchema }),
  roomsController.reactivate,
);

// PATCH /rooms/categories/:categoryId/price
registry.registerPath({
  method: "patch",
  path: "/rooms/categories/{categoryId}/price",
  tags: ["Rooms"],
  summary: "Update category price",
  description: "Updates the price per night for a specific room category.",
  security: [{ bearerAuth: [] }],
  request: {
    params: categoryIdParamsSchema,
    body: {
      content: { "application/json": { schema: updateCategoryPriceSchema } },
    },
  },
  responses: {
    200: {
      description: "Price updated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Room category not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.patch(
  "/categories/:categoryId/price",
  authorize(MANAGEMENT),
  validate({ params: categoryIdParamsSchema, body: updateCategoryPriceSchema }),
  roomsController.updateCategoryPrice,
);

// PATCH /rooms/categories/:categoryId/name
registry.registerPath({
  method: "patch",
  path: "/rooms/categories/{categoryId}/name",
  tags: ["Rooms"],
  summary: "Update category name",
  description: "Updates the name of a specific room category.",
  security: [{ bearerAuth: [] }],
  request: {
    params: categoryIdParamsSchema,
    body: { content: { "application/json": { schema: updateCategoryNameSchema } } },
  },
  responses: {
    200: {
      description: "Category name updated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: apiFailureSchema } },
    },
    404: {
      description: "Room category not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.patch(
  "/categories/:categoryId/name",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ body: updateCategoryNameSchema, params: categoryIdParamsSchema }),
  roomsController.updateCategoryName,
);

// POST /rooms/categories
registry.registerPath({
  method: "post",
  path: "/rooms/categories",
  tags: ["Rooms"],
  summary: "Create a new room category",
  description:
    "Adds a new room category with a specified name and price per night.",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createCategorySchema } } },
  },
  responses: {
    201: {
      description: "Category created successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.post(
  "/categories",
  authorize(MANAGEMENT),
  validate({ body: createCategorySchema }),
  roomsController.createCategory,
);

// POST /rooms/bulk
registry.registerPath({
  method: "post",
  path: "/rooms/bulk",
  tags: ["Rooms"],
  summary: "Bulk create rooms",
  description: "Creates multiple rooms in a single request for efficiency.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: bulkCreateRoomsSchema } },
    },
  },
  responses: {
    201: {
      description: "Rooms created successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

roomsRoutes.post(
  "/bulk",
  authorize(MANAGEMENT),
  validate({ body: bulkCreateRoomsSchema }),
  roomsController.bulkCreateRooms,
);
