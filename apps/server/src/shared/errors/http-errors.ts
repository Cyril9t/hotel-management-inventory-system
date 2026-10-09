import createError from "http-errors";

export type ErrorDetails =
  Array<{ field: string; messages: string[] }> | Record<string, unknown>;

export const UnauthorizedError = (message = "Unauthorized") =>
  createError(401, message, { code: "UNAUTHORIZED" });

export const NotFoundError = (
  message = "Resource not found",
  details?: ErrorDetails,
) =>
  createError(404, message, {
    code: "NOT_FOUND",
    ...(details ? { details } : {}),
  });

export const BadRequestError = (message = "Bad Request") =>
  createError(400, message, { code: "BAD_REQUEST" });

export const ValidationError = (
  message = "Validation failed",
  details?: ErrorDetails,
) =>
  createError(400, message, {
    code: "VALIDATION_ERROR",
    ...(details ? { details } : {}),
  });
