import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDevelopment = process.env.NODE_ENV !== "production";

  logger.error(`[${req.method} ${req.path}] ${err.message}`, {
    stack: err.stack,
  });

  if (err instanceof ZodError) {
    const body: ErrorResponseBody = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.errors.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
    };

    res.status(422).json(body);
    return;
  }

  if (err instanceof AppError) {
    const body: ErrorResponseBody = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(isDevelopment && { details: { stack: err.stack } }),
      },
    };

    res.status(err.statusCode).json(body);
    return;
  }

  // Multer file size error
  if (err.message === "File too large" || (err as any).code === "LIMIT_FILE_SIZE") {
    const body: ErrorResponseBody = {
      success: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: "Uploaded file exceeds the maximum allowed size of 10MB",
      },
    };

    res.status(413).json(body);
    return;
  }

  // Generic / unexpected error
  const body: ErrorResponseBody = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: isDevelopment ? err.message : "An unexpected error occurred",
      ...(isDevelopment && { details: { stack: err.stack } }),
    },
  };

  res.status(500).json(body);
}
