import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * Middleware that requires a valid JWT in the Authorization header.
 * Attaches `req.userId` on success, returns 401 on failure.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" },
    });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }
}
