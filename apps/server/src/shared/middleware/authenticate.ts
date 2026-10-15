import type { RequestHandler } from "express";
import { jwt } from "../lib/jwt";
import { UnauthorizedError } from "../errors/http-errors";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new UnauthorizedError("Authentication required");
  }

  const payload = jwt.verifyAccessToken(token);
  // const user = await usersRepository.findById(payload.userId);

  if (!payload || !payload.isActive) {
    throw new UnauthorizedError();
  }

  req.user = payload;
  next();
};
