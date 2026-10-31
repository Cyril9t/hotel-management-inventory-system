import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import {
  createInviteSchema,
  acceptInviteSchema,
  inviteTokenParamsSchema,
  userIdParamsSchema,
  listUsersQuerySchema,
  inviteIdParamsSchema,
  listInvitesQuerySchema,

  // responses
  usersListResponse,
  userDetailsResponse,
  userDeactivatedResponse,
  userReactivatedResponse,
  userAcceptedInviteResponse,
  inviteVerifiedResponse,
  invitesListResponse,
  inviteCreatedResponse,
  inviteResentResponse,
  inviteRoleForbiddenResponse,
  usersBadRequestResponse,
  usersUnauthorizedResponse,
  usersForbiddenResponse,
  userNotFoundResponse,
  inviteNotFoundResponse,
  invalidInviteResponse,
  pendingInviteRequiredResponse,
} from "./users.schema";

export const usersRoutes = Router();

// GET /users/invites/:token/verify
registry.registerPath({
  method: "get",
  path: "/users/invites/{token}/verify",
  tags: ["Users"],
  summary: "Verify invite token",
  description:
    "Checks if an invitation token is valid and not yet expired or accepted.",
  request: {
    params: inviteTokenParamsSchema,
  },
  responses: {
    200: {
      description: "Invite verified successfully",
      content: {
        "application/json": { schema: inviteVerifiedResponse },
      },
    },
    400: {
      description: "Invalid or expired invite token",
      content: {
        "application/json": { schema: invalidInviteResponse },
      },
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
  description:
    "Converts a valid invitation into a full staff account after the user provides a password.",
  request: {
    body: { content: { "application/json": { schema: acceptInviteSchema } } },
  },
  responses: {
    201: {
      description: "Invite accepted and user account created",
      content: {
        "application/json": { schema: userAcceptedInviteResponse },
      },
    },
    400: {
      description: "Invalid or expired invite token or password",
      content: {
        "application/json": { schema: invalidInviteResponse },
      },
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
  description:
    "Retrieves a list of all staff members with optional filters for role and department.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listUsersQuerySchema,
  },
  responses: {
    200: {
      description: "List of users retrieved successfully",
      content: {
        "application/json": { schema: usersListResponse },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": { schema: usersBadRequestResponse },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": { schema: usersUnauthorizedResponse },
      },
    },
    403: {
      description: "Insufficient permissions",
      content: {
        "application/json": { schema: usersForbiddenResponse },
      },
    },
  },
});

usersRoutes.get(
  "/",
  authorize("read", "User"),
  validate({ query: listUsersQuerySchema }),
  usersController.list,
);

// GET /users/invites
registry.registerPath({
  method: "get",
  path: "/users/invites",
  tags: ["Users"],
  summary: "Get staff invites",
  description:
    "Lists all pending invitations sent to prospective staff members.",
  security: [{ bearerAuth: [] }],
  request: {
    query: listInvitesQuerySchema,
  },
  responses: {
    200: {
      description: "List of invites retrieved",
      content: { "application/json": { schema: invitesListResponse } },
    },
  },
});

usersRoutes.get(
  "/invites",
  authorize("read", "StaffInvite"),
  validate({ query: listInvitesQuerySchema }),
  usersController.listInvites,
);

// GET /users/:id
registry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Get a staff member",
  description:
    "Retrieves detailed profile information for a specific staff member by ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: {
      description: "User details retrieved successfully",
      content: {
        "application/json": { schema: userDetailsResponse },
      },
    },
    400: {
      description: "Invalid user ID",
      content: {
        "application/json": { schema: usersBadRequestResponse },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": { schema: usersUnauthorizedResponse },
      },
    },
    403: {
      description: "Insufficient permissions",
      content: {
        "application/json": { schema: usersForbiddenResponse },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": { schema: userNotFoundResponse },
      },
    },
  },
});

usersRoutes.get(
  "/:id",
  authorize("read", "User"),
  validate({ params: userIdParamsSchema }),
  usersController.getById,
);

// POST /users/invites
registry.registerPath({
  method: "post",
  path: "/users/invites",
  tags: ["Users"],
  summary: "Invite new staff",
  description:
    "Creates a new invitation for a prospective staff member and sends them an email.",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createInviteSchema } } },
  },
  responses: {
    201: {
      description: "Invite created successfully",
      content: { "application/json": { schema: inviteCreatedResponse } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: usersBadRequestResponse } },
    },
    403: {
      description: "Actor role is not permitted to invite this role",
      content: { "application/json": { schema: inviteRoleForbiddenResponse } },
    },
  },
});

usersRoutes.post(
  "/invites",
  authorize("create", "StaffInvite"),
  validate({ body: createInviteSchema }),
  usersController.createInvite,
);

// PATCH /users/:id/deactivate
registry.registerPath({
  method: "patch",
  path: "/users/{id}/deactivate",
  tags: ["Users"],
  summary: "Deactivate a staff member (soft delete)",
  description:
    "Marks a staff member as inactive, preventing them from logging in.",
  security: [{ bearerAuth: [] }],
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: {
      description: "User deactivated successfully",
      content: {
        "application/json": { schema: userDeactivatedResponse },
      },
    },
    400: {
      description: "Invalid user ID",
      content: {
        "application/json": { schema: usersBadRequestResponse },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": { schema: usersUnauthorizedResponse },
      },
    },
    403: {
      description: "Insufficient permissions",
      content: {
        "application/json": { schema: usersForbiddenResponse },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": { schema: userNotFoundResponse },
      },
    },
  },
});

usersRoutes.patch(
  "/:id/deactivate",
  authorize("update", "User"),
  validate({ params: userIdParamsSchema }),
  usersController.deactivate,
);

// PATCH /users/:id/reactivate
registry.registerPath({
  method: "patch",
  path: "/users/{id}/reactivate",
  tags: ["Users"],
  summary: "Reactivate a deactivated staff member",
  description: "Restores an inactive staff member to active status.",
  security: [{ bearerAuth: [] }],
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: {
      description: "User reactivated successfully",
      content: {
        "application/json": { schema: userReactivatedResponse },
      },
    },
    400: {
      description: "Invalid user ID",
      content: {
        "application/json": { schema: usersBadRequestResponse },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": { schema: usersUnauthorizedResponse },
      },
    },
    403: {
      description: "Insufficient permissions",
      content: {
        "application/json": { schema: usersForbiddenResponse },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": { schema: userNotFoundResponse },
      },
    },
  },
});

usersRoutes.patch(
  "/:id/reactivate",
  authorize("update", "User"),
  validate({ params: userIdParamsSchema }),
  usersController.reactivate,
);

// POST /users/invites/:id/resend
registry.registerPath({
  method: "post",
  path: "/users/invites/{id}/resend",
  tags: ["Users"],
  summary: "Resend staff invitation email",
  description:
    "Triggers a resend of the invitation email for a specific invite ID.",
  security: [{ bearerAuth: [] }],
  request: {
    params: inviteIdParamsSchema,
  },
  responses: {
    200: {
      description: "Invitation email resent successfully",
      content: { "application/json": { schema: inviteResentResponse } },
    },
    400: {
      description: "Only pending invites can be resent",
      content: {
        "application/json": { schema: pendingInviteRequiredResponse },
      },
    },
    404: {
      description: "Invite not found",
      content: { "application/json": { schema: inviteNotFoundResponse } },
    },
  },
});

usersRoutes.post(
  "/invites/:id/resend",
  authorize("update", "StaffInvite"),
  validate({ params: inviteIdParamsSchema }),
  usersController.resendInvite,
);
