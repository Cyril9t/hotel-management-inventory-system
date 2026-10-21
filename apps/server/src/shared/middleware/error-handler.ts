import type { Request, Response, NextFunction } from "express";
import { HttpError, isHttpError } from "http-errors";
import { failure, type ApiError } from "../utils/api-response";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  (res as any).err = err;
  res.locals.err = err;

  if (isHttpError(err)) {
    const httpErr = err as HttpError;
    const apiError: ApiError = {
      code: httpErr.code ?? "UNKNOWN_ERROR",
      message: httpErr.message,
      details: httpErr.details,
    };
    return res.status(httpErr.status).json(failure(apiError));
  }

  return res.status(500).json(
    failure({
      code: "INTERNAL_ERROR",
      message: "Internal Server Error",
    }),
  );
};
