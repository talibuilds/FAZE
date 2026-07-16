/**
 * Custom application error class with HTTP status codes.
 * Used by the centralized error handler to produce consistent JSON responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  // ── Factory methods for common errors ──

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "Access denied", code = "FORBIDDEN") {
    return new AppError(message, 403, code);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code = "CONFLICT") {
    return new AppError(message, 409, code);
  }

  static tooManyRequests(message = "Too many requests, try again later", code = "RATE_LIMITED") {
    return new AppError(message, 429, code);
  }
}
