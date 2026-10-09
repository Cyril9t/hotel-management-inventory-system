import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { NotFoundError } from "../errors/http-errors";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const message = `Endpoint ${req.method} ${req.originalUrl} not found`;
  next(
    NotFoundError(message, {
      path: req.originalUrl,
      method: req.method,
    }),
  );
};
