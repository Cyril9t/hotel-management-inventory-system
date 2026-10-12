import { z } from "zod";
import { Role, Department } from "@prisma/client";

export const createInviteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Please provide a valid email address"),
  phone: z.string("Phone number is required"),
  role: z.enum(Role, "Role is required"),
  department: z.enum(Department, "Department is required"),
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

export type CreateInviteBody = z.infer<typeof createInviteSchema>;
export type AcceptInviteBody = z.infer<typeof acceptInviteSchema>;
export type InviteTokenParams = z.infer<typeof inviteTokenParamsSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
