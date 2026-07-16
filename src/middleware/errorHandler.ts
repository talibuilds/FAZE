import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

/**
 * Centralized error handler middleware.
 * Produces a consistent JSON error shape: { error: { message, code } }
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // AppError — expected, operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // Unexpected errors — log full stack, return generic message
  console.error("💥 Unexpected error:", err);
  res.status(500).json({
    error: {
      message: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    },
  });
};
