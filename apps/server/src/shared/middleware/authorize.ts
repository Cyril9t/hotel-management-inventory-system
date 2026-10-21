import type { RequestHandler } from "express";
import { getPermissions } from "../lib/permission";
import type { Permission } from "../lib/permission";
import { ForbiddenError, UnauthorizedError } from "../errors/http-errors";

export const authorize = (...rule: Permission): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) throw new UnauthorizedError();

    const permission = getPermissions(req.user);
    req.permission = permission;

    if (permission.cannot(...rule)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
};
