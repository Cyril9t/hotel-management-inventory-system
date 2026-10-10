import type { ErrorDetails } from "../errors/http-errors";

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
