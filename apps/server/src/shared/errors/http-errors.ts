import createError from "http-errors";

export type ErrorDetails = Record<string, unknown>;

export class UnauthorizedError extends createError.Unauthorized {
  code = "UNAUTHORIZED";
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class NotFoundError extends createError.NotFound {
  code = "NOT_FOUND";
  details?: ErrorDetails;
  constructor(message = "Resource not found", details?: ErrorDetails) {
    super(message);
    if (details) this.details = details;
  }
}

export class BadRequestError extends createError.BadRequest {
  code = "BAD_REQUEST";
  constructor(message = "Bad Request") {
    super(message);
  }
}

export class ValidationError extends createError.BadRequest {
  code = "VALIDATION_ERROR";
  details?: ErrorDetails;
  constructor(message = "Validation failed", details?: ErrorDetails) {
    super(message);
    if (details) this.details = details;
  }
}

export class CorsError extends createError.BadRequest {
  code = "CORS_DENIED";
  constructor(message = "Origin not allowed by CORS") {
    super(message);
  }
}
