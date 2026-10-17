import type { RequestHandler } from "express";
import { jwt } from "../lib/jwt";
import { UnauthorizedError } from "../errors/http-errors";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new UnauthorizedError("Authentication required");
  }

  try {
    const payload = jwt.verifyAccessToken(token);

    if (!payload || !payload.isActive) {
      throw new UnauthorizedError("Invalid or inactive user session");
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return next(err);
    }
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};
