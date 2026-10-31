import type { ErrorDetails } from "../errors/http-errors";
import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export function apiSuccessSchema<T extends z.ZodType>(data: T, id?: string) {
  const schema = z.object({
    success: z.literal(true),
    data,
  });
  return id ? schema.meta({ id }) : schema;
}

export function apiFailureSchema<E extends z.ZodType = typeof apiErrorSchema>(
  error: E,
  id?: string,
) {
  const schema = z.object({
    success: z.literal(false),
    error,
  });
  return id ? schema.meta({ id }) : schema;
}

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: ApiError;
};

export type ApiError = {
  code: string;
  message: string;
  details?: ErrorDetails;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function success<T>(data: T): ApiSuccess<T> {
  return {
    success: true as const,
    data,
  };
}

export function failure({ code, message, details }: ApiError): ApiFailure {
  return {
    success: false as const,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };
}
