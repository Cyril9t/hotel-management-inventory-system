import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "#shared/middleware/validator";
import { registry } from "#shared/openapi/registry";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  loginResponseSchema,
} from "./auth.schema";

export const authRoutes = Router();

// auth/login
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
      content: { "application/json": { schema: loginResponseSchema } },
    },
    401: { description: "Invalid email or password" },
  },
});

authRoutes.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);


//auth/refresh
authRoutes.post("/refresh", authController.refresh);



authRoutes.post("/logout", authController.logout);



authRoutes.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);



authRoutes.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);
