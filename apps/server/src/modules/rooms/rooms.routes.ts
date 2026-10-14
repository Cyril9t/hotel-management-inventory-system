import { Router } from "express";
import { roomsController } from "./rooms.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import {
  createRoomSchema,
  updateRoomSchema,
  roomIdParamsSchema,
  categoryIdParamsSchema,
  updateCategoryPriceSchema,
} from "./rooms.schema";
import type { Role } from "@prisma/client";

export const roomsRoutes = Router();

roomsRoutes.use(authenticate);

const MANAGEMENT = ["GENERAL_MANAGER", "OWNER"] as Role[];
const STAFF = ["RECEPTIONIST", "GENERAL_MANAGER", "OWNER"] as Role[];

roomsRoutes.get("/", authorize(STAFF), roomsController.list);
roomsRoutes.get(
  "/:id",
  authorize(STAFF),
  validate({ params: roomIdParamsSchema }),
  roomsController.getById,
);
roomsRoutes.post(
  "/",
  authorize(MANAGEMENT),
  validate({ body: createRoomSchema }),
  roomsController.create,
);
roomsRoutes.patch(
  "/:id",
  authorize(MANAGEMENT),
  validate({ params: roomIdParamsSchema, body: updateRoomSchema }),
  roomsController.update,
);
roomsRoutes.patch(
  "/:id/deactivate",
  authorize(MANAGEMENT),
  validate({ params: roomIdParamsSchema }),
  roomsController.deactivate,
);
roomsRoutes.patch(
  "/:id/reactivate",
  authorize(MANAGEMENT),
  validate({ params: roomIdParamsSchema }),
  roomsController.reactivate,
);
roomsRoutes.patch(
  "/categories/:categoryId/price",
  authorize(MANAGEMENT),
  validate({ params: categoryIdParamsSchema, body: updateCategoryPriceSchema }),
  roomsController.updateCategoryPrice,
);
