import { z } from "zod";
import { apiSuccessSchema } from "#shared/utils/api-response";
import { publicUserSchema } from "../users/users.schema";
import {
  badRequestErrorSchema,
  unauthorizedErrorSchema,
} from "src/shared/errors/http-error-schemas";

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please provide a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginBody = z.infer<typeof loginSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;

// Login
export const loginResponseSchema = apiSuccessSchema(
  z.object({
    user: publicUserSchema,
    accessToken: z.string(),
  }),
);

// Get current session
export const getSessionResponseSchema = apiSuccessSchema(
  z.object({
    user: publicUserSchema,
  }),
);

// Refresh access token
export const refreshTokenResponseSchema = apiSuccessSchema(
  z.object({
    accessToken: z.string(),
  }),
);

export const authBadRequestResponse = badRequestErrorSchema("Bad request");
export const authUnauthorizedResponse = unauthorizedErrorSchema("Unauthorized");
