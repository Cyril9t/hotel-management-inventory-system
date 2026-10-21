import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/http-errors";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const message = `Endpoint ${req.method} ${req.originalUrl} not found`;
  next(
    new NotFoundError(message, {
      path: req.originalUrl,
      method: req.method,
    }),
  );
};
