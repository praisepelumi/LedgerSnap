import { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface PaginatedResponse<T> {
  success: true;
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Send a successful JSON response.
 */
export function success<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>
): void {
  const body: SuccessResponse<T> = { success: true, data };

  if (meta !== undefined) {
    body.meta = meta;
  }

  res.status(statusCode).json(body);
}

/**
 * Send a paginated JSON response with computed totalPages.
 */
export function paginated<T>(
  res: Response,
  data: T,
  page: number,
  limit: number,
  total: number
): void {
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  res.status(200).json(body);
}

/**
 * Send a standardized error JSON response.
 */
export function error(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: unknown
): void {
  const body: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };

  res.status(statusCode).json(body);
}
