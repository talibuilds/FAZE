import { Request, Response, NextFunction } from "express";

/**
 * Simple request logger middleware.
 * Logs method, URL, status code, and response time.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const color =
      statusCode >= 500
        ? "\x1b[31m" // red
        : statusCode >= 400
          ? "\x1b[33m" // yellow
          : statusCode >= 300
            ? "\x1b[36m" // cyan
            : "\x1b[32m"; // green
    const reset = "\x1b[0m";

    console.log(
      `${color}${method}${reset} ${originalUrl} → ${color}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
};
