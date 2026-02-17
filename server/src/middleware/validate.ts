import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidationSource = "body" | "query" | "params";

/**
 * Creates an Express middleware that validates `req[source]` against the
 * provided Zod schema. On success the raw value is replaced with the
 * parsed result (applying coercions, defaults, and transforms). On
 * failure the ZodError is forwarded to the next error handler.
 */
export function validate(
  schema: ZodSchema,
  source: ValidationSource = "body"
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    // Replace the raw data with the parsed/coerced output so downstream
    // handlers receive clean, typed values.
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}
