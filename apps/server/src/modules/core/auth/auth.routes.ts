import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "#shared/middleware/validator";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);
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
