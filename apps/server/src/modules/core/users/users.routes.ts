import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { apiSuccessSchema, apiFailureSchema } from "#shared/utils/api-response";
import {
  createInviteSchema,
  acceptInviteSchema,
  inviteTokenParamsSchema,
  userIdParamsSchema,
  listUsersQuerySchema,
  inviteIdParamsSchema,
} from "./users.schema";

export const usersRoutes = Router();

// GET /users/invites/:token/verify
registry.registerPath({
  method: "get",
  path: "/users/invites/:token/verify",
  tags: ["Users"],
  summary: "Verify invite token",
  request: {
    params: inviteTokenParamsSchema,
  },
  responses: {
    200: {
      description: "Invite verified successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid or expired invite",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

usersRoutes.get(
  "/invites/:token/verify",
  validate({ params: inviteTokenParamsSchema }),
  usersController.verifyInvite,
);

// POST /users/invites/accept
registry.registerPath({
  method: "post",
  path: "/users/invites/accept",
  tags: ["Users"],
  summary: "Accept invite and create account",
  request: {
    body: { content: { "application/json": { schema: acceptInviteSchema } } },
  },
  responses: {
    200: {
      description: "Invite accepted and user created",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid or expired invite",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

usersRoutes.post(
  "/invites/accept",
  validate({ body: acceptInviteSchema }),
  usersController.acceptInvite,
);

usersRoutes.use(authenticate);

// GET /users/
registry.registerPath({
  method: "get",
  path: "/users",
  tags: ["Users"],
  summary: "Get staff",
  security: [{ bearerAuth: [] }],
  request: {
    query: listUsersQuerySchema,
  },
  responses: {
    200: {
      description: "List of users retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
  },
});

usersRoutes.get(
  "/",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ query: listUsersQuerySchema }),
  usersController.list,
);

// GET /users/:id
registry.registerPath({
  method: "get",
  path: "/users/:id",
  tags: ["Users"],
  summary: "Get a staff member",
  security: [{ bearerAuth: [] }],
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: {
      description: "User details retrieved",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

usersRoutes.get(
  "/:id",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ params: userIdParamsSchema }),
  usersController.getById,
);

// POST /users/invites
registry.registerPath({
  method: "post",
  path: "/users/invites",
  tags: ["Users"],
  summary: "Invite new staff",
  security: [{ bearerAuth: [] }],

  request: {
    body: { content: { "application/json": { schema: createInviteSchema } } },
  },
  responses: {
    201: {
      description: "Invite created successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: apiFailureSchema } },
    },
    403: {
      description: "Forbidden: Actor role is not permitted to invite this role",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

usersRoutes.post(
  "/invites",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ body: createInviteSchema }),
  usersController.createInvite,
);

// PATCH /users/:id/deactivate
registry.registerPath({
  method: "patch",
  path: "/users/:id/deactivate",
  tags: ["Users"],
  summary: "Deactivate a staff member (soft delete)",
  security: [{ bearerAuth: [] }],
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: {
      description: "User deactivated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

usersRoutes.patch(
  "/:id/deactivate",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ params: userIdParamsSchema }),
  usersController.deactivate,
);

// PATCH /users/:id/reactivate
registry.registerPath({
  method: "patch",
  path: "/users/:id/reactivate",
  tags: ["Users"],
  summary: "Reactivate a deactivated staff member",
  security: [{ bearerAuth: [] }],
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: {
      description: "User reactivated successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

usersRoutes.patch(
  "/:id/reactivate",
  authorize(["GENERAL_MANAGER", "OWNER"]),
  validate({ params: userIdParamsSchema }),
  usersController.reactivate,
);

// POST /users/invites/:id/resend
registry.registerPath({
  method: "post",
  path: "/users/invites/:id/resend",
  tags: ["Users"],
  summary: "Resend staff invitation email",
  security: [{ bearerAuth: [] }],
  request: {
    params: inviteIdParamsSchema,
  },
  responses: {
    200: {
      description: "Invitation email resent successfully",
      content: { "application/json": { schema: apiSuccessSchema } },
    },
    404: {
      description: "Invite not found",
      content: { "application/json": { schema: apiFailureSchema } },
    },
  },
});

usersRoutes.post(
  "/invites/:id/resend",
  authenticate,
  authorize(["OWNER", "GENERAL_MANAGER"]),
  validate({ params: inviteIdParamsSchema }),
  usersController.resendInvite,
);
