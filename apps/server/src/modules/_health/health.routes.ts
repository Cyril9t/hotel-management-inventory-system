import { Router } from "express";
import { healthController } from "./health.controller";

export const healthRoutes = Router();

healthRoutes.get("/health", healthController.getStatus);
healthRoutes.get("/", healthController.getRoot);
