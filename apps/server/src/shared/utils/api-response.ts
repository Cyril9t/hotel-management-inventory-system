import type { ErrorDetails } from "../errors/http-errors";
import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const apiDataSchema = z.record(z.string(), z.unknown());

export const apiFailureSchema = z
  .object({
    success: z.literal(false),
    error: apiErrorSchema,
  })
  .meta({ id: "ApiFailure" });

export const apiSuccessSchema = z
  .object({
    success: z.literal(true),
    data: apiDataSchema,
  })
  .meta({ id: "ApiSuccess" });

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
