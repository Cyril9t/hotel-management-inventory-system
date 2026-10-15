import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import { apiSuccessSchema, apiFailureSchema } from "#shared/utils/api-response";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema";

export const authRoutes = Router();

// POST /auth/login
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": { schema: apiSuccessSchema },
      },
    },
    401: {
      description: "Invalid email or password",
      content: {
        "application/json": { schema: apiFailureSchema },
      },
    },
  },
});

authRoutes.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);

// POST /auth/refresh
registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Access token refreshed successfully",
      content: {
        "application/json": { schema: apiSuccessSchema },
      },
    },
    401: {
      description: "Invalid or expired refresh token",
      content: {
        "application/json": { schema: apiFailureSchema },
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
  responses: {
    200: {
      description: "Logged out successfully",
      content: {
        "application/json": {
          schema: apiSuccessSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": { schema: apiFailureSchema },
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
  request: {
    body: { content: { "application/json": { schema: forgotPasswordSchema } } },
  },
  responses: {
    200: {
      description: "Password reset email sent (if account exists)",
      content: {
        "application/json": {
          schema: apiSuccessSchema,
        },
      },
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
  request: {
    body: { content: { "application/json": { schema: resetPasswordSchema } } },
  },
  responses: {
    200: {
      description: "Password reset successfully",
      content: {
        "application/json": {
          schema: apiSuccessSchema,
        },
      },
    },
    400: {
      description: "Invalid or expired reset token",
      content: {
        "application/json": { schema: apiFailureSchema },
      },
    },
  },
});

authRoutes.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);
