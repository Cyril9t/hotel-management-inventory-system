import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { authenticate } from "src/shared/middleware/authenticate";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  // responses
  loginResponseSchema,
  getSessionResponseSchema,
  refreshTokenResponseSchema,
  authBadRequestResponse,
  authUnauthorizedResponse,
} from "./auth.schema";

export const authRoutes = Router();

// POST /auth/login
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Authenticate user and get tokens",
  request: {
    body: { content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": { schema: loginResponseSchema },
      },
    },
    400: {
      description: "Invalid login request",
      content: {
        "application/json": { schema: authBadRequestResponse },
      },
    },
    401: {
      description: "Invalid email or password",
      content: {
        "application/json": { schema: authUnauthorizedResponse },
      },
    },
  },
});

authRoutes.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);

// GET /auth/session
registry.registerPath({
  method: "get",
  path: "/auth/session",
  tags: ["Auth"],
  summary: "Get current session",
  description:
    "Returns the authenticated user's profile for the current access token.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current session retrieved successfully",
      content: {
        "application/json": { schema: getSessionResponseSchema },
      },
    },
    401: {
      description: "Session is no longer valid",
      content: {
        "application/json": { schema: authUnauthorizedResponse },
      },
    },
  },
});

authRoutes.get("/session", authenticate, authController.getSession);

// POST /auth/refresh
registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access token using refresh token cookie",
  responses: {
    200: {
      description: "Access token refreshed successfully",
      content: {
        "application/json": { schema: refreshTokenResponseSchema },
      },
    },
    401: {
      description: "Invalid or expired refresh token",
      content: {
        "application/json": { schema: authUnauthorizedResponse },
      },
    },
  },
});

authRoutes.post("/refresh", authController.refresh);

// POST /auth/logout
registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout user and clear refresh token",
  responses: {
    204: {
      description: "Logged out successfully",
    },
    401: {
      description: "Invalid refresh token",
      content: {
        "application/json": { schema: authUnauthorizedResponse },
      },
    },
  },
});

authRoutes.post("/logout", authController.logout);

// POST /auth/forgot-password
registry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["Auth"],
  summary: "Request password reset email",
  request: {
    body: { content: { "application/json": { schema: forgotPasswordSchema } } },
  },
  responses: {
    204: {
      description: "Password reset email sent (if account exists)",
    },
  },
});

authRoutes.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);

// POST /auth/reset-password
registry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Auth"],
  summary: "Reset password using token",
  request: {
    body: { content: { "application/json": { schema: resetPasswordSchema } } },
  },
  responses: {
    204: {
      description: "Password reset successfully",
    },
    400: {
      description: "Invalid request or expired reset token",
      content: {
        "application/json": { schema: authBadRequestResponse },
      },
    },
  },
});

authRoutes.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);
