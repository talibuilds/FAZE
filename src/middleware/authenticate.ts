import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "../utils/AppError";

export interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request to carry authenticated user info
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * JWT authentication middleware.
 * Extracts token from "Authorization: Bearer <token>" header,
 * verifies it, and attaches decoded payload to req.user.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or malformed Authorization header"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized("Token has expired"));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(AppError.unauthorized("Invalid token"));
    }
    next(err);
  }
};
