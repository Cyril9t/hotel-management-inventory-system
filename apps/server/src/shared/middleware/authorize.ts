import type { RequestHandler } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../errors/http-errors";

export const authorize = (allowed: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowed.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    next();
  };
};
