import { z } from "zod";
import { Role, Department, InviteStatus } from "@prisma/client";
import { apiSuccessSchema } from "#shared/utils/api-response";
import {
  notFoundErrorSchema,
  badRequestErrorSchema,
  unauthorizedErrorSchema,
  forbiddenErrorSchema,
} from "#shared/errors/http-error-schemas";

export const createInviteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Please provide a valid email address"),
  phone: z.string("Phone number is required"),
  role: z.enum(Role, "Role is required"),
  // department: z.enum(Department, "Department is required"),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const inviteTokenParamsSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
});

export const userIdParamsSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(Role).optional(),
  department: z.enum(Department).optional(),
});

export const inviteIdParamsSchema = z.object({
  id: z.uuid("Invalid invite id"),
});

export const listInvitesQuerySchema = z.object({
  status: z.enum(InviteStatus).optional(),
  role: z.enum(Role).optional(),
  department: z.enum(Department).optional(),
});

export type CreateInviteBody = z.infer<typeof createInviteSchema>;
export type AcceptInviteBody = z.infer<typeof acceptInviteSchema>;
export type InviteTokenParams = z.infer<typeof inviteTokenParamsSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type InviteIdParams = z.infer<typeof inviteIdParamsSchema>;
export type ListInvitesQuery = z.infer<typeof listInvitesQuerySchema>;

// Public user
export const publicUserSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string(),
  role: z.enum(Role),
  department: z.enum(Department).nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  deactivatedAt: z.iso.datetime().nullable(),
});

// User responses
export const usersListResponse = apiSuccessSchema(
  z.object({
    users: z.array(publicUserSchema),
  }),
);

export const userDetailsResponse = apiSuccessSchema(
  z.object({
    user: publicUserSchema,
  }),
);

export const userDeactivatedResponse = apiSuccessSchema(
  z.object({
    user: publicUserSchema,
  }),
);

export const userReactivatedResponse = apiSuccessSchema(
  z.object({
    user: publicUserSchema,
  }),
);

export const userAcceptedInviteResponse = apiSuccessSchema(
  z.object({
    user: publicUserSchema,
  }),
);

// Invite verification response
export const inviteVerifiedResponse = apiSuccessSchema(
  z.object({
    invite: z.object({
      email: z.email(),
      role: z.enum(Role),
      department: z.enum(Department).nullable(),
    }),
  }),
);

// Generic errors
export const usersBadRequestResponse = badRequestErrorSchema("Bad request");
export const usersUnauthorizedResponse =
  unauthorizedErrorSchema("Unauthorized");
export const usersForbiddenResponse = forbiddenErrorSchema("Forbidden");

export const userNotFoundResponse = notFoundErrorSchema("User not found");

export const inviteNotFoundResponse = notFoundErrorSchema("Invite not found");

export const invalidInviteResponse = badRequestErrorSchema(
  "Invalid or expired invite",
);

export const pendingInviteRequiredResponse = badRequestErrorSchema(
  "Only pending invites can be resent",
);

// Invite entity (StaffInvite, token hash excluded)
export const inviteSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string(),
  role: z.enum(Role),
  department: z.enum(Department).nullable(),
  status: z.enum(InviteStatus),
  expiresAt: z.iso.datetime(),
  createdByUserId: z.uuid(),
  acceptedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export const invitesListResponse = apiSuccessSchema(
  z.object({ invites: z.array(inviteSchema) }),
);

export const inviteCreatedResponse = apiSuccessSchema(
  z.object({ invite: inviteSchema }),
);

export const inviteResentResponse = apiSuccessSchema(
  z.object({ invite: inviteSchema }),
);

export const inviteRoleForbiddenResponse = forbiddenErrorSchema(
  "Actor role is not permitted to invite this role",
);
