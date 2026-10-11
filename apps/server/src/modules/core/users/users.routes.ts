import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validator";
import {
  createInviteSchema,
  acceptInviteSchema,
  inviteTokenParamsSchema,
  userIdParamsSchema,
  listUsersQuerySchema,
} from "./users.schema";

export const usersRoutes = Router();

usersRoutes.get(
  "/invites/:token/verify",
  validate({ params: inviteTokenParamsSchema }),
  usersController.verifyInvite,
);
usersRoutes.post(
  "/invites/accept",
  validate({ body: acceptInviteSchema }),
  usersController.acceptInvite,
);

usersRoutes.use(authenticate);

usersRoutes.get(
  "/",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ query: listUsersQuerySchema }),
  usersController.list,
);
usersRoutes.get(
  "/:id",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ params: userIdParamsSchema }),
  usersController.getById,
);
usersRoutes.post(
  "/invites",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ body: createInviteSchema }),
  usersController.createInvite,
);
usersRoutes.patch(
  "/:id/deactivate",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ params: userIdParamsSchema }),
  usersController.deactivate,
);
usersRoutes.patch(
  "/:id/reactivate",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ params: userIdParamsSchema }),
  usersController.reactivate,
);
