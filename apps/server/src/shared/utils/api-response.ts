export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export interface ApiError {
  message: string;
  details?: Record<string, unknown[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function success<T>(data: T): ApiSuccess<T> {
  return {
    success: true as const,
    data,
  };
}

export function failure({ message, details }: ApiError): ApiFailure {
  return {
    success: false as const,
    error: {
      message,
      ...(details !== undefined && { details }),
    },
  };
}
