import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Validates request body/query/params against a Zod schema.
 * Returns middleware that runs validation before the route handler.
 *
 * Usage:
 *   router.post("/register", validate(registerSchema), authController.register);
 */
export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data; // Replace with parsed/sanitized data
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        res.status(400).json({
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: messages,
          },
        });
        return;
      }
      next(err);
    }
  };
};
